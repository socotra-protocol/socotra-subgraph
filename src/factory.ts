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
    branch.branchAddr = event.params.branchAddr;
    branch.parentToken = event.params.parentToken;
    branch.parentAmount = event.params.amount;
    branch.owner = event.transaction.from;
    let managerContract = SocotraBranchManager.bind(event.params.branchAddr);
    const branchInfo = managerContract.branchInfo();
    const voteToken = branchInfo.value1;
    const branchName = branchInfo.value2;
    const imageUrl = branchInfo.value3;
    branch.voteToken = voteToken;
    branch.name = branchName;
    branch.imageUrl = imageUrl;
    BranchManagerTemplate.create(event.params.branchAddr);
  }

  branch.save();
}
