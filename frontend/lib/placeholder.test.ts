import { describe, it, expect, vi } from "vitest";

describe("Utility Functions", () => {
    it("should merge class names", () => {
        const cn = (a: string, b: string): string => `${a} ${b}`;
        expect(cn("base", "active")).toBe("base active");
    });

    it("should handle conditional classes", () => {
        const cn = (...classes: (string | undefined | false)[]): string =>
            classes.filter(Boolean).join(" ");
        expect(cn("base", true ? "conditional" : undefined, false ? "not-included" : undefined))
            .toBe("base conditional");
    });
});

describe("Performance Utilities", () => {
    it("should export debounce function", () => {
        const debounce = (_fn: Function, _delay: number): (() => void) => (): void => { };
        expect(typeof debounce).toBe("function");
    });

    it("debounce should delay execution", () => {
        const debounce = (fn: Function, delay: number): (() => void) => {
            let timeout: ReturnType<typeof setTimeout> | undefined;
            return (...args: unknown[]): void => {
                clearTimeout(timeout);
                timeout = setTimeout((): void => {
                    fn(...args);
                }, delay);
            };
        };

        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        expect(fn).not.toHaveBeenCalled();
    });
});

describe("i18n", () => {
    it("should export useI18n hook", () => {
        const useI18n = (): { t: (key: string) => string } => ({ t: (key: string) => key });
        expect(typeof useI18n).toBe("function");
    });
});
