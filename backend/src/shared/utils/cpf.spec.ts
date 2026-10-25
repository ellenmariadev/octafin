import { isValidCpf, maskCpf, maskCpfForStorage, normalizeCpf } from "./cpf";

describe("cpf", () => {
  describe("normalizeCpf", () => {
    it("removes non-digit characters", () => {
      expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
    });
  });

  describe("maskCpf", () => {
    it("formats a numeric CPF", () => {
      expect(maskCpf("52998224725")).toBe("529.982.247-25");
    });

    it("returns the input unchanged when length is invalid", () => {
      expect(maskCpf("123")).toBe("123");
    });
  });

  describe("maskCpfForStorage", () => {
    it("masks the middle digits", () => {
      expect(maskCpfForStorage("52998224725")).toBe("529.***.***-25");
    });
  });

  describe("isValidCpf", () => {
    it.each(["111.444.777-35", "529.982.247-25", "93541134780"])("accepts valid CPF %s", (cpf) => {
      expect(isValidCpf(cpf)).toBe(true);
    });

    it.each(["111.444.777-36", "00000000000", "11111111111", "123", "", "529.982.247-24"])(
      "rejects invalid CPF %s",
      (cpf) => {
        expect(isValidCpf(cpf)).toBe(false);
      },
    );
  });
});
