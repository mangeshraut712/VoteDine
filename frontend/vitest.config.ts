import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: ['node_modules', 'e2e'],
        coverage: {
            reporter: ['text', 'json', 'lcov'],
            exclude: ['node_modules', 'e2e'],
        },
    },
});
