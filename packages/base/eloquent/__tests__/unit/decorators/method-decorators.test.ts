/**
 * @file method-decorators.test.ts
 * @description Unit tests for all method-level decorators: @Scope, @GlobalScope,
 * @Accessor, @Mutator, @BeforeCreate, @AfterCreate, @BeforeUpdate, @AfterUpdate,
 * @BeforeDelete, and @AfterDelete.
 *
 * Each test applies a decorator to a class method and verifies that the correct
 * scope, accessor/mutator, or hook metadata is stored in MetadataStorage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { Scope } from '@/decorators/scope.decorator';
import { GlobalScope } from '@/decorators/global-scope.decorator';
import { Accessor } from '@/decorators/accessor.decorator';
import { Mutator } from '@/decorators/mutator.decorator';
import { BeforeCreate } from '@/decorators/before-create.decorator';
import { AfterCreate } from '@/decorators/after-create.decorator';
import { BeforeUpdate } from '@/decorators/before-update.decorator';
import { AfterUpdate } from '@/decorators/after-update.decorator';
import { BeforeDelete } from '@/decorators/before-delete.decorator';
import { AfterDelete } from '@/decorators/after-delete.decorator';

let storage: MetadataStorage;

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
});

// ---------------------------------------------------------------------------
// @Scope
// ---------------------------------------------------------------------------

describe('@Scope decorator', () => {
  it('registers a local scope with the method name', () => {
    class User {
      @Scope()
      scopeActive() {}
    }

    const scopes = storage.getScopes(User);
    expect(scopes.size).toBe(1);

    const scope = scopes.get('scopeActive')!;
    expect(scope.methodName).toBe('scopeActive');
    expect(scope.type).toBe('local');
  });
});

// ---------------------------------------------------------------------------
// @GlobalScope
// ---------------------------------------------------------------------------

describe('@GlobalScope decorator', () => {
  it('registers a global scope with the given name', () => {
    class User {
      @GlobalScope('active')
      scopeActive() {}
    }

    const scopes = storage.getScopes(User);
    expect(scopes.size).toBe(1);

    const scope = scopes.get('scopeActive')!;
    expect(scope.methodName).toBe('scopeActive');
    expect(scope.type).toBe('global');
    expect(scope.name).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// @Accessor
// ---------------------------------------------------------------------------

describe('@Accessor decorator', () => {
  it('registers an accessor with the given field name', () => {
    class User {
      @Accessor('fullName')
      getFullName() {
        return 'John Doe';
      }
    }

    const entries = storage.getAccessorsMutators(User);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.methodName).toBe('getFullName');
    expect(entries[0]!.fieldName).toBe('fullName');
    expect(entries[0]!.type).toBe('accessor');
  });
});

// ---------------------------------------------------------------------------
// @Mutator
// ---------------------------------------------------------------------------

describe('@Mutator decorator', () => {
  it('registers a mutator with the given field name', () => {
    class User {
      @Mutator('password')
      setPassword(value: string) {
        return value;
      }
    }

    const entries = storage.getAccessorsMutators(User);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.methodName).toBe('setPassword');
    expect(entries[0]!.fieldName).toBe('password');
    expect(entries[0]!.type).toBe('mutator');
  });
});

// ---------------------------------------------------------------------------
// @BeforeCreate
// ---------------------------------------------------------------------------

describe('@BeforeCreate decorator', () => {
  it('registers a hook with event beforeCreate', () => {
    class User {
      @BeforeCreate()
      generateId() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('generateId');
    expect(hooks[0]!.event).toBe('beforeCreate');
  });
});

// ---------------------------------------------------------------------------
// @AfterCreate
// ---------------------------------------------------------------------------

describe('@AfterCreate decorator', () => {
  it('registers a hook with event afterCreate', () => {
    class User {
      @AfterCreate()
      sendWelcome() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('sendWelcome');
    expect(hooks[0]!.event).toBe('afterCreate');
  });
});

// ---------------------------------------------------------------------------
// @BeforeUpdate
// ---------------------------------------------------------------------------

describe('@BeforeUpdate decorator', () => {
  it('registers a hook with event beforeUpdate', () => {
    class User {
      @BeforeUpdate()
      validateAge() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('validateAge');
    expect(hooks[0]!.event).toBe('beforeUpdate');
  });
});

// ---------------------------------------------------------------------------
// @AfterUpdate
// ---------------------------------------------------------------------------

describe('@AfterUpdate decorator', () => {
  it('registers a hook with event afterUpdate', () => {
    class User {
      @AfterUpdate()
      logUpdate() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('logUpdate');
    expect(hooks[0]!.event).toBe('afterUpdate');
  });
});

// ---------------------------------------------------------------------------
// @BeforeDelete
// ---------------------------------------------------------------------------

describe('@BeforeDelete decorator', () => {
  it('registers a hook with event beforeDelete', () => {
    class User {
      @BeforeDelete()
      checkDeps() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('checkDeps');
    expect(hooks[0]!.event).toBe('beforeDelete');
  });
});

// ---------------------------------------------------------------------------
// @AfterDelete
// ---------------------------------------------------------------------------

describe('@AfterDelete decorator', () => {
  it('registers a hook with event afterDelete', () => {
    class User {
      @AfterDelete()
      cleanupFiles() {}
    }

    const hooks = storage.getHooks(User);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]!.methodName).toBe('cleanupFiles');
    expect(hooks[0]!.event).toBe('afterDelete');
  });
});
