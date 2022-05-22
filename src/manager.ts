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
import { Branch } from "../generated/schema";

export function handleProxyRegistered(event: ProxyRegistered): void {}
export function handleUpdateSnapshot(event: UpdateSnapshot): void {}
export function handleDelegateSpace(event: DelegateSpace): void {}
export function handleRegisterMember(event: RegisterMember): void {}
export function handleClaimToken(event: ClaimToken): void {}
export function handleRequestPayout(event: RequestPayout): void {}
export function handleWithdrawPayout(event: WithdrawPayout): void {}
export function handleIssuePayout(event: IssuePayout): void {}
