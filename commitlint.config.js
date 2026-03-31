export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式（不影响功能）
        'refactor', // 代码重构（不影响功能）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建或依赖更新
        'ci', // CI 配置
        'chore', // 其他不修改源代码或文档的更改
        'revert', // 回滚
        'merge' // 合并分支
      ]
    ],
    // 类型大小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题尾部不要有句号
    'subject-full-stop': [2, 'never', '.'],
    // 主题最大长度
    'subject-max-length': [2, 'always', 100],
    // 正文最大行宽
    'body-max-line-length': [2, 'always', 100],
    // 结尾最多一个空行
    'body-leading-blank': [2, 'always'],
    // footer 最长
    'footer-max-line-length': [2, 'always', 100]
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型:',
      scope: '选择一个提交范围 (可选):',
      customScope: '输入自定义的提交范围:',
      subject: '填写简短描述:',
      body: '详细描述 (可选)。使用 "|" 换行:',
      breakingBreaking: '列出所有破坏性变更 (可选)。使用 "|" 换行:',
      breakingBody: '详细描述破坏性变更 (可选):',
      footerPrefixesSelect: '选择关联 Issue 类型 (可选):',
      customFooterPrefix: '输入自定义的 Issue 类型前缀:',
      footer: '关联 Issue (可选)。例如: #31, #I32PRF:',
      generatingByAI: '正在通过 AI 生成你的提交信息...',
      done: '信息确认完毕!',
      abort: '确定要取消吗?'
    },
    types: [
      { value: 'feat', name: 'feat:     新功能', emoji: '✨' },
      { value: 'fix', name: 'fix:      修复 bug', emoji: '🐛' },
      { value: 'docs', name: 'docs:     文档更新', emoji: '📝' },
      { value: 'style', name: 'style:    代码格式', emoji: '💄' },
      { value: 'refactor', name: 'refactor: 代码重构', emoji: '♻️' },
      { value: 'perf', name: 'perf:     性能优化', emoji: '⚡️' },
      { value: 'test', name: 'test:     测试相关', emoji: '✅' },
      { value: 'build', name: 'build:    构建或依赖', emoji: '📦️' },
      { value: 'ci', name: 'ci:       CI 配置', emoji: '🔧' },
      { value: 'chore', name: 'chore:    其他更改', emoji: '🔨' },
      { value: 'revert', name: 'revert:   回滚', emoji: '⏪' },
      { value: 'merge', name: 'merge:    合并分支', emoji: '🔀' }
    ],
    useEmoji: false,
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   关闭 Issue' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: 100,
    maxSubjectLength: 100,
    minSubjectLength: 5,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: ''
  }
}
