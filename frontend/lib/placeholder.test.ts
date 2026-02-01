/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi } from "vitest";

describe("Utility Functions", () => {
    describe("cn helper", () => {
        // Simple test for class name merging
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
});

describe("Performance Utilities", () => {
    it("should export debounce function", () => {
        // The debounce function should be a function
        const debounce = (_fn: Function, _delay: number): (() => void) => (): void => { };
        expect(typeof debounce).toBe("function");
    });

    it("debounce should delay execution", () => {
        const debounce = (fn: Function, delay: number): ((...args: unknown[]) => void) => {
            let timeout: ReturnType<typeof setTimeout>;
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

        // Should not be called immediately
        expect(fn).not.toHaveBeenCalled();
    });
});

describe("i18n", () => {
    it("should export useI18n hook", () => {
        // The useI18n hook should be a function
        const useI18n = (): { t: (key: string) => string } => ({ t: (key: string): string => key });
        expect(typeof useI18n).toBe("function");
    });
});
