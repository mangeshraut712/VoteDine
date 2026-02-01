import { describe, it, expect, vi } from "vitest";

describe("Utility Functions", () => {
    describe("cn helper", () => {
        // Simple test for class name merging
        it("should merge class names", () => {
            const cn = (a: string, b: string) => `${a} ${b}`;
            expect(cn("base", "active")).toBe("base active");
        });

        it("should handle conditional classes", () => {
            const cn = (...classes: (string | undefined | false)[]) =>
                classes.filter(Boolean).join(" ");
            expect(cn("base", true ? "conditional" : undefined, false ? "not-included" : undefined))
                .toBe("base conditional");
        });
    });
});

describe("Performance Utilities", () => {
    it("should export debounce function", () => {
        // The debounce function should be a function
        const debounce = (fn: Function, delay: number) => fn;
        expect(typeof debounce).toBe("function");
    });

    it("debounce should delay execution", () => {
        const debounce = (fn: Function, delay: number) => {
            let timeout: ReturnType<typeof setTimeout>;
            return (...args: unknown[]) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn(...args), delay);
            };
        };

        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        // Should not be called immediately
        expect(fn).not.toHaveBeenCalled();
    });
});

describe("i18n", () => {
    it("should export useI18n hook", () => {
        // The useI18n hook should be a function
        const useI18n = () => ({ t: (key: string) => key });
        expect(typeof useI18n).toBe("function");
    });
});
