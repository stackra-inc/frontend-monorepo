/**
 * Support Utilities Demo Page
 *
 * Demonstrates @stackra/ts-support features:
 * - `Str` class for string manipulation (lower, upper, kebab, snake, etc.)
 * - Interactive input with live transformations
 * - Collection class for array operations
 *
 * @module pages/demos/ts-support
 */

import { useState } from "react";
import { Str } from "@stackra/ts-support";
import { Card, TextField, Input, Label } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single Str transformation result.
 */
interface Transformation {
  /** Display label for the transformation */
  label: string;
  /** The Str method name */
  method: string;
  /** The transformed result */
  result: string;
}

/**
 * Compute all Str transformations for a given input string.
 *
 * @param input - The raw string to transform
 * @returns An array of transformation results
 */
function computeTransformations(input: string): Transformation[] {
  if (!input) return [];

  return [
    { label: "Str.lower()", method: "lower", result: Str.lower(input) },
    { label: "Str.upper()", method: "upper", result: Str.upper(input) },
    { label: "Str.ucfirst()", method: "ucfirst", result: Str.ucfirst(input) },
    { label: "Str.kebab()", method: "kebab", result: Str.kebab(input) },
    { label: "Str.snake()", method: "snake", result: Str.snake(input) },
    { label: "Str.studly()", method: "studly", result: Str.studly(input) },
    { label: "Str.slug()", method: "slug", result: Str.slug(input) },
    {
      label: "Str.limit(input, 15)",
      method: "limit",
      result: Str.limit(input, 15),
    },
    {
      label: 'Str.contains(input, "hello")',
      method: "contains",
      result: String(Str.contains(input, "hello")),
    },
  ];
}

/**
 * TsSupportDemo — interactive demo of Str utilities.
 *
 * Users type text into an input field and see all Str transformations
 * applied in real time.
 *
 * @returns The support utilities demo page
 */
export default function TsSupportDemo() {
  const [input, setInput] = useState("Hello World Example");
  const [searchNeedle, setSearchNeedle] = useState("hello");

  const transformations = computeTransformations(input);

  // Separate contains check with custom needle
  const containsResult = input ? String(Str.contains(input, searchNeedle)) : "—";

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-support</h1>
          <p className="mt-1 text-muted">
            String utilities, Collection helpers, and the Facade pattern.
          </p>
        </div>

        {/* ── Interactive Input ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Str Transformations</Card.Title>
          </Card.Header>
          <Card.Content>
            <TextField name="input-text" value={input} onChange={(value) => setInput(value)}>
              <Label>Input text</Label>
              <Input placeholder="Type something..." />
            </TextField>

            {transformations.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transformations.map((t) => (
                  <Card key={t.method} variant="transparent">
                    <Card.Content className="bg-accent/10 rounded-lg p-3">
                      <span className="block text-xs font-mono text-muted">{t.label}</span>
                      <span className="block mt-1 font-mono text-sm text-foreground break-all">
                        {t.result}
                      </span>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Str.contains() Interactive ───────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Str.contains() — Search</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <TextField name="haystack" value={input} isReadOnly>
                  <Label>Haystack</Label>
                  <Input />
                </TextField>
              </div>
              <div className="flex-1">
                <TextField
                  name="needle"
                  value={searchNeedle}
                  onChange={(value) => setSearchNeedle(value)}
                >
                  <Label>Needle</Label>
                  <Input placeholder="Search for..." />
                </TextField>
              </div>
            </div>
            <div className="mt-3 bg-accent/10 rounded-lg p-3">
              <span className="font-mono text-sm text-foreground">
                Str.contains(&quot;{Str.limit(input, 30)}&quot;, &quot;
                {searchNeedle}&quot;) → <strong>{containsResult}</strong>
              </span>
            </div>
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import { Str } from "@stackra/ts-support";

// String transformations
Str.lower("Hello World");     // "hello world"
Str.upper("Hello World");     // "HELLO WORLD"
Str.ucfirst("hello");         // "Hello"
Str.kebab("helloWorld");      // "hello-world"
Str.snake("helloWorld");      // "hello_world"
Str.studly("hello_world");    // "HelloWorld"
Str.slug("Hello World!");     // "hello-world"
Str.limit("Long text...", 5); // "Long ..."

// Search
Str.contains("Hello", "ell"); // true`}
            </pre>
          </Card.Content>
        </Card>
      </section>
    </DefaultLayout>
  );
}
