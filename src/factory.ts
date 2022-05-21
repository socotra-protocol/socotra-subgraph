import { BigInt } from "@graphprotocol/graph-ts";
import {
  SocotraFactory,
  SplitBranch,
} from "../generated/SocotraFactory/SocotraFactory";
import { SocotraBranchManager } from "../generated/SocotraBranchManager/SocotraBranchManager";
import { Branch } from "../generated/schema";

export function handleSplitBranch(event: SplitBranch): void {
  let entity = Branch.load(event.transaction.from.toHex());

  if (!entity) {
    entity = new Branch(event.params.branchId.toString());
    entity.count = BigInt.fromI32(0);
    entity.branchAddr = event.params.branchAddr;
    entity.parentToken = event.params.parentToken;

    let managerContract = SocotraBranchManager.bind(event.params.branchAddr);
    const branchInfo = managerContract.branchInfo();
    const voteToken = branchInfo.value1;
    entity.voteToken = voteToken;
  }

  entity.save();
}
