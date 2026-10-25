import {
  canTransitionOffer,
  isBankOfferActive,
  isBankOfferTerminal,
  type BankOfferStatus,
} from "./types/bank-offer.status";
import {
  isSimulationOpen,
  isSimulationTerminal,
  type SimulationStatus,
} from "./types/simulation.status";

describe("bank offer status transitions", () => {
  it.each<[BankOfferStatus, BankOfferStatus]>([
    ["PENDING", "IN_PROGRESS"],
    ["PENDING", "TIMEOUT"],
    ["PENDING", "ERROR"],
    ["IN_PROGRESS", "APPROVED"],
    ["IN_PROGRESS", "DENIED"],
    ["IN_PROGRESS", "TIMEOUT"],
    ["IN_PROGRESS", "ERROR"],
  ])("allows %s -> %s", (from, to) => {
    expect(canTransitionOffer(from, to)).toBe(true);
  });

  it.each<[BankOfferStatus, BankOfferStatus]>([
    ["APPROVED", "DENIED"],
    ["DENIED", "APPROVED"],
    ["TIMEOUT", "APPROVED"],
    ["ERROR", "APPROVED"],
    ["APPROVED", "IN_PROGRESS"],
    ["DENIED", "PENDING"],
    ["TIMEOUT", "PENDING"],
    ["ERROR", "PENDING"],
    ["IN_PROGRESS", "PENDING"],
  ])("forbids %s -> %s", (from, to) => {
    expect(canTransitionOffer(from, to)).toBe(false);
  });

  it("marks only terminal statuses as terminal", () => {
    const terminal: BankOfferStatus[] = ["APPROVED", "DENIED", "TIMEOUT", "ERROR"];
    for (const status of terminal) {
      expect(isBankOfferTerminal(status)).toBe(true);
      expect(isBankOfferActive(status)).toBe(false);
    }
    for (const status of ["PENDING", "IN_PROGRESS"] as BankOfferStatus[]) {
      expect(isBankOfferTerminal(status)).toBe(false);
      expect(isBankOfferActive(status)).toBe(true);
    }
  });
});

describe("simulation status", () => {
  it("treats COMPLETED, PARTIAL and FAILED as terminal", () => {
    for (const status of ["COMPLETED", "PARTIAL", "FAILED"] as SimulationStatus[]) {
      expect(isSimulationTerminal(status)).toBe(true);
      expect(isSimulationOpen(status)).toBe(false);
    }
  });

  it("treats QUEUED and PROCESSING as open", () => {
    for (const status of ["QUEUED", "PROCESSING"] as SimulationStatus[]) {
      expect(isSimulationTerminal(status)).toBe(false);
      expect(isSimulationOpen(status)).toBe(true);
    }
  });
});
