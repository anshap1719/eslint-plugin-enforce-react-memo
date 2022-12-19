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
            ExportNamedDeclaration(node) {
                if (
                    node.declaration?.type ===
                    AST_NODE_TYPES.VariableDeclaration
                ) {
                    const declaration = node.declaration.declarations[0];
                    if (
                        declaration.type === AST_NODE_TYPES.VariableDeclarator
                    ) {
                        const init = declaration.init;
                        if (!init) {
                            // Not a component
                            return;
                        }

                        const name =
                            declaration.id.type === AST_NODE_TYPES.Identifier
                                ? declaration.id.name
                                : undefined;

                        if (
                            init.type ===
                                AST_NODE_TYPES.ArrowFunctionExpression &&
                            name &&
                            // Shallow checking for component declaration
                            name.charAt(0) === name.charAt(0).toUpperCase()
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
                }
            },
            ExportDefaultDeclaration(node) {
                if (node.declaration.type === AST_NODE_TYPES.Identifier) {
                    const identifier = node.declaration.name;

                    const declarationNode = (
                        (node.parent as any).body as TSESTree.BaseNode[]
                    ).find(item => {
                        if (item.type === AST_NODE_TYPES.VariableDeclaration) {
                            const declaration = (
                                item as TSESTree.VariableDeclaration
                            ).declarations[0];

                            if (
                                declaration.type ===
                                AST_NODE_TYPES.VariableDeclarator
                            ) {
                                const id = declaration.id;
                                if (id.type === AST_NODE_TYPES.Identifier) {
                                    return id.name === identifier;
                                }
                            }
                        }
                    }) as TSESTree.VariableDeclaration | undefined;

                    if (!declarationNode) {
                        return;
                    }

                    const init = declarationNode.declarations[0].init;

                    if (!init) {
                        return;
                    }

                    if (init.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                        context.report({
                            node: declarationNode,
                            messageId: 'general',
                        });
                        return;
                    }

                    if (init.type === AST_NODE_TYPES.CallExpression) {
                        const callee = (init as CallExpression).callee;

                        if (callee.type === AST_NODE_TYPES.Identifier) {
                            if ((callee as Identifier).name !== 'memo') {
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
