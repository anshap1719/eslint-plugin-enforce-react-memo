import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { CallExpression, Identifier } from 'node-estree/dist/estree';
import createRule from '../util/createRule';

const enforceReactMemo = createRule({
    name: 'enforce-react-memo',
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

                    const isExportMemoized = (
                        (node.parent as any).body as TSESTree.BaseNode[]
                    )?.some(item => {
                        if (
                            item.type ===
                            AST_NODE_TYPES.ExportDefaultDeclaration
                        ) {
                            const exportDeclaration = (
                                item as TSESTree.ExportDefaultDeclaration
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
                        }

                        return false;
                    });

                    if (
                        init.type === AST_NODE_TYPES.ArrowFunctionExpression &&
                        name &&
                        // Shallow checking for component declaration
                        name.charAt(0) === name.charAt(0).toUpperCase() &&
                        !isExportMemoized
                    ) {
                        // TODO: Only report if component
                        context.report({
                            node,
                            messageId: 'general',
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

export default enforceReactMemo;
