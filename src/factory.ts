import { BigInt } from "@graphprotocol/graph-ts";
import {
  SocotraFactory,
  SplitBranch,
} from "../generated/SocotraFactory/SocotraFactory";
import { SocotraBranchManager } from "../generated/templates/SocotraBranchManager/SocotraBranchManager";
import { SocotraBranchManager as BranchManagerTemplate } from "../generated/templates";
import { Branch } from "../generated/schema";

export function handleSplitBranch(event: SplitBranch): void {
  let branch = Branch.load(event.params.branchAddr);

  if (!branch) {
    branch = new Branch(event.params.branchAddr);
    branch.count = BigInt.fromI32(0);
    branch.branchAddr = event.params.branchAddr;
    branch.parentToken = event.params.parentToken;

    let managerContract = SocotraBranchManager.bind(event.params.branchAddr);
    const branchInfo = managerContract.branchInfo();
    const voteToken = branchInfo.value1;
    branch.voteToken = voteToken;

    BranchManagerTemplate.create(event.params.branchAddr);
  }

  branch.save();
}
