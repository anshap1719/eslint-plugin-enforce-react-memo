import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint';
import memoizeComponent from '../../rules/memoizeComponent';

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('memoize-component', memoizeComponent, {
    valid: [
        {
            code: `
                const Component = () => {
                    return <div>Something</div>;
                };

                export default memo(component);
            `,
        },
        {
            code: `
                const Component = memo(() => {
                    return <div>Something</div>;
                });

                export default Component;
            `,
        },
        {
            code: `
                export const Component = memo(() => {
                    return <div>Something</div>;
                });
            `,
        },
        {
            code: `
                export const Component = memo(forwardRef(() => {
                    return <div>Something</div>;
                }));
            `,
        },
        {
            code: `
                export const nonComponentFunction = () => {
                    return <div>Something</div>;
                };
            `,
        },
        {
            code: `
                const nonComponentFunction = () => {
                    return <div>Something</div>;
                };

                export default nonComponentFunction;
            `,
        },
        {
            code: `
                const NonExportedComponent = memo(() => {
                    return <div>Something</div>;
                });
            `,
        },
    ],
    invalid: [
        {
            code: `
                const Component = () => {
                    return <div>Something</div>;
                };

                export default Component;
            `,
            errors: [{ messageId: 'general' }],
            output: `
                const Component = () => {
                    return <div>Something</div>;
                };

                export default memo(Component);
            `,
        },
        {
            code: `
                export const Component = () => {
                    return <div>Something</div>;
                };
            `,
            errors: [{ messageId: 'general' }],
            output: `
                export const Component = memo(() => {
                    return <div>Something</div>;
                });
            `,
        },
        {
            code: `
                export const Component = forwardRef(() => {
                    return <div>Something</div>;
                });
            `,
            errors: [{ messageId: 'general' }],
            output: `
                export const Component = memo(forwardRef(() => {
                    return <div>Something</div>;
                }));
            `,
        },
        {
            code: `
                const NonExportedComponent = () => {
                    return <div>Something</div>;
                };
            `,
            errors: [{ messageId: 'general' }],
            output: `
                const NonExportedComponent = memo(() => {
                    return <div>Something</div>;
                });
            `,
        },
    ],
});
