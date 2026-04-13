/**
 * @file schema-resolver.test.ts
 * @description Unit tests for the SchemaResolver class.
 *
 * Verifies that SchemaResolver correctly reads decorator metadata from
 * MetadataStorage and produces a valid RxJsonSchema, including support
 * for @Column, @PrimaryKey, @Index, @Final, @Default, @Ref, @Timestamps,
 * @SoftDeletes, and round-trip decompilation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { SchemaResolver } from '@/schema/schema.resolver';
import { Column } from '@/decorators/column.decorator';
import { PrimaryKey } from '@/decorators/primary-key.decorator';
import { Index } from '@/decorators/index.decorator';
import { Final } from '@/decorators/final.decorator';
import { Default } from '@/decorators/default.decorator';
import { Ref } from '@/decorators/ref.decorator';
import { Timestamps } from '@/decorators/timestamps.decorator';
import { SoftDeletes } from '@/decorators/soft-deletes.decorator';

let resolver: SchemaResolver;

beforeEach(() => {
  MetadataStorage.getInstance().clear();
  resolver = new SchemaResolver();
});

// ---------------------------------------------------------------------------
// Test classes with decorators (defined inside describe to re-register after clear)
// ---------------------------------------------------------------------------

describe('SchemaResolver', () => {
  it('resolves a decorated class to RxJsonSchema', () => {
    @Timestamps()
    class User {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Column({ type: 'string', maxLength: 255 })
      declare name: string;
    }

    const schema = resolver.resolve(User);

    expect(schema.version).toBe(0);
    expect(schema.type).toBe('object');
    expect(schema.primaryKey).toBe('id');
    expect(schema.properties.id).toBeDefined();
    expect(schema.properties.name).toBeDefined();
  });

  it('@Column({ type: "string", maxLength: 100 }) produces property with type and maxLength', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Column({ type: 'string', maxLength: 100 })
      declare name: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.name!.type).toBe('string');
    expect(schema.properties.name!.maxLength).toBe(100);
  });

  it('@PrimaryKey() sets primaryKey field', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 50 })
      declare uid: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.primaryKey).toBe('uid');
  });

  it('@Index() causes field to appear in indexes', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Index()
      @Column({ type: 'string', maxLength: 255 })
      declare email: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.indexes).toContain('email');
  });

  it('@Final() produces property with final=true', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Final()
      @Column({ type: 'string', maxLength: 100 })
      declare slug: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.slug!.final).toBe(true);
  });

  it('@Default("active") produces property with default="active"', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Default('active')
      @Column({ type: 'string', maxLength: 50 })
      declare status: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.status!.default).toBe('active');
  });

  it('@Ref("profiles") produces property with ref="profiles"', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Ref('profiles')
      @Column({ type: 'string', maxLength: 100 })
      declare profile_id: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.profile_id!.ref).toBe('profiles');
  });

  it('@Timestamps() auto-adds created_at and updated_at', () => {
    @Timestamps()
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.created_at!).toBeDefined();
    expect(schema.properties.created_at!.format).toBe('date-time');
    expect(schema.properties.updated_at!).toBeDefined();
    expect(schema.properties.updated_at!.format).toBe('date-time');
  });

  it('@SoftDeletes() auto-adds deleted_at', () => {
    @SoftDeletes()
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;
    }

    const schema = resolver.resolve(TestModel);

    expect(schema.properties.deleted_at!).toBeDefined();
    expect(schema.properties.deleted_at!.format).toBe('date-time');
  });

  // -------------------------------------------------------------------------
  // decompile() round-trip
  // -------------------------------------------------------------------------

  it('decompile() round-trip works', () => {
    class TestModel {
      @PrimaryKey()
      @Column({ type: 'string', maxLength: 100 })
      declare id: string;

      @Index()
      @Column({ type: 'string', maxLength: 255 })
      declare email: string;

      @Column({ type: 'integer' })
      declare age: number;
    }

    const schema = resolver.resolve(TestModel);
    const decompiled = resolver.decompile(schema);

    expect(decompiled.has('id')).toBe(true);
    expect(decompiled.has('email')).toBe(true);
    expect(decompiled.has('age')).toBe(true);

    expect(decompiled.get('id')!.isPrimary).toBe(true);
    expect(decompiled.get('email')!.isIndex).toBe(true);
    expect(decompiled.get('age')!.options.type).toBe('integer');
  });
});
