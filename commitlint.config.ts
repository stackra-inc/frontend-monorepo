import type { UserConfig } from '@commitlint/types';

/**
 * Commitlint Configuration
 *
 * Enforces conventional commit message format.
 *
 * @see https://commitlint.js.org/
 * @see https://www.conventionalcommits.org/
 */
const config: UserConfig = {
  /**
   * Extend conventional commit configuration
   */
  extends: ['@commitlint/config-conventional'],

  /**
   * Custom rules
   */
  rules: {
    /**
     * Allowed commit types
     *
     * @example
     * feat: add new feature
     * fix: resolve bug
     * docs: update documentation
     */
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system changes
        'ci', // CI/CD changes
        'chore', // Other changes (dependencies, etc.)
        'revert', // Revert a previous commit
      ],
    ],

    /**
     * Subject case must be lowercase
     */
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],

    /**
     * Subject must not end with a period
     */
    'subject-full-stop': [2, 'never', '.'],

    /**
     * Subject must not be empty
     */
    'subject-empty': [2, 'never'],

    /**
     * Type must not be empty
     */
    'type-empty': [2, 'never'],

    /**
     * Scope is optional but must be lowercase if provided
     */
    'scope-case': [2, 'always', 'lower-case'],

    /**
     * Header (first line) max length
     */
    'header-max-length': [2, 'always', 100],

    /**
     * Body max line length
     */
    'body-max-line-length': [2, 'always', 100],

    /**
     * Footer max line length
     */
    'footer-max-line-length': [2, 'always', 100],
  },

  /**
   * Custom prompt configuration
   */
  prompt: {
    settings: {},
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g. component or file name)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};

export default config;
