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
} from "../generated/SocotraBranchManager/SocotraBranchManager";
import { Branch, Member, MemberBranch, Payout } from "../generated/schema";

export function handleProxyRegistered(event: ProxyRegistered): void {}
export function handleUpdateSnapshot(event: UpdateSnapshot): void {}
export function handleDelegateSpace(event: DelegateSpace): void {}
export function handleRegisterMember(event: RegisterMember): void {
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

    let payout = Payout.load(
      memberBranch.id.toHexString() + event.params.id.toString()
    );
  }
}
export function handleWithdrawPayout(event: WithdrawPayout): void {}
export function handleIssuePayout(event: IssuePayout): void {}
