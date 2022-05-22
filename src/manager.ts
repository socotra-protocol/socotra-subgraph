import { BigInt } from "@graphprotocol/graph-ts";
import {
  SocotraBranchManager,
  ProxyRegistered,
  UpdateSnapshot,
  DelegateSpace,
  RegisterMember,
  ClaimToken,
  RequestPayout,
  WithdrawPayout,
  IssuePayout,
} from "../generated/templates/SocotraBranchManager/SocotraBranchManager";
import { Branch, Member, MemberBranch, Payout } from "../generated/schema";

export function handleProxyRegistered(event: ProxyRegistered): void {}
export function handleUpdateSnapshot(event: UpdateSnapshot): void {}
export function handleDelegateSpace(event: DelegateSpace): void {}
export function handleRegisterMember(event: RegisterMember): void {
  // get branch
  let branch = Branch.load(event.address);
  if (branch) {
    branch.voteAmount = branch.voteAmount.plus(event.params.voteAmount);
  }

  // get member
  let member = Member.load(event.params.memberAddr);

  if (!member) {
    // create new member
    member = new Member(event.params.memberAddr);
    member.save();
    // get memberBranch
    let memberBranch = MemberBranch.load(
      event.params.memberAddr.concat(event.address)
    );
    if (!memberBranch) {
      // create new memberBranch
      memberBranch = new MemberBranch(
        event.params.memberAddr.concat(event.address)
      );
      memberBranch.member = event.params.memberAddr;
      memberBranch.branch = event.address;
    }

    // add tokens amount
    memberBranch.availableTokens = memberBranch.availableTokens.plus(
      event.params.voteAmount
    );
    memberBranch.totalTokens = memberBranch.totalTokens.plus(
      event.params.voteAmount
    );
    memberBranch.rewardAmount = memberBranch.rewardAmount.plus(
      event.params.rewardAmount
    );
    memberBranch.save();
  }
}
export function handleClaimToken(event: ClaimToken): void {
  let memberBranch = MemberBranch.load(
    event.params.memberAddr.concat(event.address)
  );

  if (memberBranch) {
    memberBranch.availableTokens = memberBranch.availableTokens.minus(
      event.params.tokenAmount
    );
    memberBranch.save();
  }
}
export function handleRequestPayout(event: RequestPayout): void {
  let memberBranch = MemberBranch.load(
    event.params.issuer.concat(event.address)
  );

  if (memberBranch) {
    memberBranch.claimingTokens = memberBranch.claimingTokens.plus(
      event.params.amount
    );
    memberBranch.save();

    // let payout = Payout.load(
    //   memberBranch.id.toHexString() + event.params.id.toString()
    // );

    let payout = new Payout(
      memberBranch.branch.toHexString() + event.params.id.toString()
    );
    payout.issuer = event.params.issuer;
    payout.branch = event.address;
    payout.payoutId = event.params.id;
    payout.amount = event.params.amount;
    payout.receiver = event.params.receiver;
    payout.proof = event.params.proof;
    payout.isPaid = false;
    payout.save();
  }
}
export function handleWithdrawPayout(event: WithdrawPayout): void {
  let payout = Payout.load(
    event.address.toHexString() + event.params.id.toString()
  );

  if (payout) {
    payout.isPaid = true;

    let memberBranch = MemberBranch.load(payout.issuer.concat(event.address));

    if (memberBranch) {
      // update claiming tokens
      memberBranch.claimingTokens = memberBranch.claimingTokens.minus(
        payout.amount
      );
      memberBranch.save();
    }
    payout.save();
  }
}
export function handleIssuePayout(event: IssuePayout): void {
  let payout = Payout.load(
    event.address.toHexString() + event.params.id.toString()
  );

  if (payout) {
    payout.isPaid = true;

    let memberBranch = MemberBranch.load(payout.issuer.concat(event.address));

    if (memberBranch) {
      // update tokens
      const payoutAmount = calPayoutAmount(
        payout.amount,
        memberBranch.totalTokens,
        memberBranch.rewardAmount
      );
      memberBranch.claimingTokens = memberBranch.rewardAmount.minus(
        payoutAmount
      );
      memberBranch.claimingTokens = memberBranch.claimingTokens.minus(
        payout.amount
      );
      memberBranch.totalTokens = memberBranch.totalTokens.minus(payout.amount);

      memberBranch.save();

      // load branch
      let branch = Branch.load(memberBranch.branch);
      if (branch) {
        branch.parentAmount = branch.parentAmount.minus(payoutAmount);
      }
    }
    payout.save();
  }
}

export function calPayoutAmount(
  claimAmount: BigInt,
  totalMemberToken: BigInt,
  totalMemberReward: BigInt
): BigInt {
  return claimAmount.times(totalMemberReward).div(totalMemberToken);
}
