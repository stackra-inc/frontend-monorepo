/**
 * @file property-decorators.test.ts
 * @description Unit tests for all property-level decorators: @Column, @PrimaryKey,
 * @Fillable, @Guarded, @Hidden, @Visible, @Cast, @Index, @Final, @Default, and @Ref.
 *
 * Each test applies a decorator to a class property and verifies that the correct
 * column metadata and flags are stored in MetadataStorage. Also tests that multiple
 * decorators on a single property compose correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { Column } from '@/decorators/column.decorator';
import { PrimaryKey } from '@/decorators/primary-key.decorator';
import { Fillable } from '@/decorators/fillable.decorator';
import { Guarded } from '@/decorators/guarded.decorator';
import { Hidden } from '@/decorators/hidden.decorator';
import { Visible } from '@/decorators/visible.decorator';
import { Cast } from '@/decorators/cast.decorator';
import { Index } from '@/decorators/index.decorator';
import { Final } from '@/decorators/final.decorator';
import { Default } from '@/decorators/default.decorator';
import { Ref } from '@/decorators/ref.decorator';

let storage: MetadataStorage;

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
});

// ---------------------------------------------------------------------------
// @Column
// ---------------------------------------------------------------------------

describe('@Column decorator', () => {
  it('registers a column with correct options', () => {
    class User {
      @Column({ type: 'string', maxLength: 100 })
      declare name: string;
    }

    const col = storage.getColumns(User).get('name')!;
    expect(col).toBeDefined();
    expect(col.propertyKey).toBe('name');
    expect(col.options.type).toBe('string');
    expect(col.options.maxLength).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// @PrimaryKey
// ---------------------------------------------------------------------------

describe('@PrimaryKey decorator', () => {
  it('sets isPrimary to true', () => {
    class User {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;
    }

    const col = storage.getColumns(User).get('id')!;
    expect(col.isPrimary).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Fillable
// ---------------------------------------------------------------------------

describe('@Fillable decorator', () => {
  it('sets isFillable to true', () => {
    class User {
      @Fillable()
      @Column({ type: 'string' })
      declare name: string;
    }

    const col = storage.getColumns(User).get('name')!;
    expect(col.isFillable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Guarded
// ---------------------------------------------------------------------------

describe('@Guarded decorator', () => {
  it('sets isGuarded to true', () => {
    class User {
      @Guarded()
      @Column({ type: 'string' })
      declare role: string;
    }

    const col = storage.getColumns(User).get('role')!;
    expect(col.isGuarded).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Hidden
// ---------------------------------------------------------------------------

describe('@Hidden decorator', () => {
  it('sets isHidden to true', () => {
    class User {
      @Hidden()
      @Column({ type: 'string' })
      declare password: string;
    }

    const col = storage.getColumns(User).get('password')!;
    expect(col.isHidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Visible
// ---------------------------------------------------------------------------

describe('@Visible decorator', () => {
  it('sets isVisible to true', () => {
    class User {
      @Visible()
      @Column({ type: 'string' })
      declare name: string;
    }

    const col = storage.getColumns(User).get('name')!;
    expect(col.isVisible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Cast
// ---------------------------------------------------------------------------

describe('@Cast decorator', () => {
  it('sets castType to the given type', () => {
    class User {
      @Cast('date')
      @Column({ type: 'string', format: 'date-time' })
      declare createdAt: Date;
    }

    const col = storage.getColumns(User).get('createdAt')!;
    expect(col.castType).toBe('date');
  });
});

// ---------------------------------------------------------------------------
// @Index
// ---------------------------------------------------------------------------

describe('@Index decorator', () => {
  it('sets isIndex to true', () => {
    class User {
      @Index()
      @Column({ type: 'string', maxLength: 255 })
      declare email: string;
    }

    const col = storage.getColumns(User).get('email')!;
    expect(col.isIndex).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Final
// ---------------------------------------------------------------------------

describe('@Final decorator', () => {
  it('sets isFinal to true', () => {
    class User {
      @Final()
      @Column({ type: 'string', maxLength: 100 })
      declare slug: string;
    }

    const col = storage.getColumns(User).get('slug')!;
    expect(col.isFinal).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @Default
// ---------------------------------------------------------------------------

describe('@Default decorator', () => {
  it('sets defaultValue to the given value', () => {
    class User {
      @Default('active')
      @Column({ type: 'string' })
      declare status: string;
    }

    const col = storage.getColumns(User).get('status')!;
    expect(col.defaultValue).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// @Ref
// ---------------------------------------------------------------------------

describe('@Ref decorator', () => {
  it('sets ref to the given collection name', () => {
    class User {
      @Ref('profiles')
      @Column({ type: 'string', maxLength: 100 })
      declare profile_id: string;
    }

    const col = storage.getColumns(User).get('profile_id')!;
    expect(col.ref).toBe('profiles');
  });
});

// ---------------------------------------------------------------------------
// Combined decorators
// ---------------------------------------------------------------------------

describe('Combined property decorators', () => {
  it('a property with @Column + @Fillable + @Index + @Cast has all flags set', () => {
    class Product {
      @Cast('integer')
      @Index()
      @Fillable()
      @Column({ type: 'integer', minimum: 0 })
      declare price: number;
    }

    const col = storage.getColumns(Product).get('price')!;
    expect(col.options.type).toBe('integer');
    expect(col.options.minimum).toBe(0);
    expect(col.isFillable).toBe(true);
    expect(col.isIndex).toBe(true);
    expect(col.castType).toBe('integer');
  });
});
