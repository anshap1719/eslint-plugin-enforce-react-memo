import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import createRule from '../util/createRule';

const memoizeComponent = createRule({
    name: 'memoize-component',
    meta: {
        docs: {
            description: 'React components should be memoized',
            recommended: 'warn',
        },
        messages: {
            general: 'Memoize this component',
        },
        type: 'problem',
        schema: [
            {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        ],
        fixable: 'code',
    },
    defaultOptions: [{ ignoreHooks: [] as string[] }],
    create(context) {
        return {
            VariableDeclaration(node) {
                const declaration = node.declarations[0];

                if (declaration.type === AST_NODE_TYPES.VariableDeclarator) {
                    const init = declaration.init;
                    if (!init) {
                        // Not a component
                        return;
                    }

                    const name =
                        declaration.id.type === AST_NODE_TYPES.Identifier
                            ? declaration.id.name
                            : undefined;

                    const defaultExportNode = (
                        (node.parent as any).body as TSESTree.BaseNode[]
                    )?.find(item => {
                        return (
                            item.type ===
                            AST_NODE_TYPES.ExportDefaultDeclaration
                        );
                    }) as TSESTree.ExportDefaultDeclaration | undefined;

                    if (
                        init.type === AST_NODE_TYPES.ArrowFunctionExpression &&
                        name &&
                        // Shallow checking for component declaration
                        name.charAt(0) === name.charAt(0).toUpperCase()
                    ) {
                        if (!defaultExportNode) {
                            // TODO: Only report if component
                            context.report({
                                node,
                                messageId: 'general',
                                *fix(fixer) {
                                    yield fixer.insertTextBefore(init, 'memo(');

                                    yield fixer.insertTextAfter(init, ')');
                                },
                            });

                            return;
                        }

                        const isDefaultExportMemoized = (() => {
                            const exportDeclaration = (
                                defaultExportNode as TSESTree.ExportDefaultDeclaration
                            ).declaration;

                            if (
                                exportDeclaration &&
                                exportDeclaration.type ===
                                    AST_NODE_TYPES.CallExpression
                            ) {
                                const callee = exportDeclaration.callee;
                                if (
                                    callee.type === AST_NODE_TYPES.Identifier &&
                                    callee.name === 'memo'
                                ) {
                                    return true;
                                }
                            }
                        })();

                        if (isDefaultExportMemoized) {
                            return;
                        }

                        context.report({
                            node: defaultExportNode,
                            messageId: 'general',
                            *fix(fixer) {
                                yield fixer.insertTextBefore(
                                    defaultExportNode.declaration,
                                    'memo('
                                );

                                yield fixer.insertTextAfter(
                                    defaultExportNode.declaration,
                                    ')'
                                );
                            },
                        });

                        return;
                    }

                    if (init.type === AST_NODE_TYPES.CallExpression) {
                        const callee = init.callee;
                        if (callee.type === AST_NODE_TYPES.Identifier) {
                            if (callee.name !== 'memo') {
                                context.report({
                                    node,
                                    messageId: 'general',
                                    *fix(fixer) {
                                        yield fixer.insertTextBefore(
                                            init,
                                            'memo('
                                        );

                                        yield fixer.insertTextAfter(init, ')');
                                    },
                                });

                                return;
                            }
                        }
                    }
                }
            },
        };
    },
});

export default memoizeComponent;
