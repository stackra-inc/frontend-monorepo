/**
 * HTTP Client Demo Page
 *
 * Demonstrates @stackra/ts-http features:
 * - GET requests to a public API (jsonplaceholder.typicode.com)
 * - POST requests with JSON body
 * - Response display with status codes
 * - Loading states and error handling
 *
 * @module pages/demos/ts-http
 */

import { useState, useCallback } from "react";
import { HttpFacade } from "@stackra/ts-http";
import { Card, Button, TextField, Input, Label, TextArea } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single log entry in the HTTP demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
  /** Whether this is an error entry */
  isError?: boolean;
}

/**
 * TsHttpDemo — interactive HTTP client demo.
 *
 * Makes real requests to jsonplaceholder.typicode.com and displays
 * the request/response cycle in a scrollable log.
 *
 * @returns The HTTP demo page
 */
export default function TsHttpDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [postBody, setPostBody] = useState('{"title":"Hello","body":"World","userId":1}');

  /**
   * Append a message to the log output.
   *
   * @param message - The message to log
   * @param isError - Whether this is an error message
   */
  const log = useCallback((message: string, isError = false) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, isError }]);
  }, []);

  /**
   * Execute a GET request to the specified URL.
   */
  const handleGet = useCallback(async () => {
    setIsLoading(true);
    log(`GET ${url}`);
    try {
      const response = await HttpFacade.get(url);

      log(`Status: ${String(response.status)}`);
      log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [url, log]);

  /**
   * Execute a POST request with the specified body.
   */
  const handlePost = useCallback(async () => {
    setIsLoading(true);
    const postUrl = "https://jsonplaceholder.typicode.com/posts";

    log(`POST ${postUrl}`);
    log(`Body: ${postBody}`);
    try {
      let parsedBody: unknown;

      try {
        parsedBody = JSON.parse(postBody);
      } catch {
        parsedBody = postBody;
      }

      const response = await HttpFacade.post(postUrl, parsedBody);

      log(`Status: ${String(response.status)}`);
      log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [postBody, log]);

  /**
   * Fetch a list of posts (GET /posts?_limit=5).
   */
  const handleFetchList = useCallback(async () => {
    setIsLoading(true);
    const listUrl = "https://jsonplaceholder.typicode.com/posts?_limit=5";

    log(`GET ${listUrl}`);
    try {
      const response = await HttpFacade.get(listUrl);

      log(`Status: ${String(response.status)}`);
      log(`Received ${Array.isArray(response.data) ? String(response.data.length) : "?"} items`);
      log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [log]);

  /**
   * Trigger a 404 error to demonstrate error handling.
   */
  const handleError = useCallback(async () => {
    setIsLoading(true);
    const badUrl = "https://jsonplaceholder.typicode.com/posts/99999";

    log(`GET ${badUrl} (expecting 404)`);
    try {
      const response = await HttpFacade.get(badUrl);

      log(`Status: ${String(response.status)}`);
      log(`Response: ${JSON.stringify(response.data)}`);
    } catch (err) {
      log(`Caught error: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [log]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-http</h1>
          <p className="mt-1 text-muted">HTTP client with GET/POST support and error handling.</p>
        </div>

        {/* ── GET Request ──────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>GET Request</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="mb-3">
              <TextField name="get-url" value={url} onChange={(v) => setUrl(v)}>
                <Label>URL</Label>
                <Input className="font-mono text-sm" />
              </TextField>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button isPending={isLoading} onPress={handleGet}>
                Send GET
              </Button>
              <Button isPending={isLoading} onPress={handleFetchList}>
                Fetch Posts List
              </Button>
              <Button variant="danger" isPending={isLoading} onPress={handleError}>
                Trigger 404
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* ── POST Request ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>POST Request</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="mb-3">
              <TextField name="post-body" value={postBody} onChange={(v) => setPostBody(v)}>
                <Label>Request Body (JSON)</Label>
                <TextArea className="font-mono text-sm" rows={3} />
              </TextField>
            </div>
            <Button isPending={isLoading} onPress={handlePost}>
              Send POST
            </Button>
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import { HttpFacade } from "@stackra/ts-http";

// GET request
const response = await HttpFacade.get(
  "https://jsonplaceholder.typicode.com/posts/1"
);
console.log(response.status, response.data);

// POST request
const created = await HttpFacade.post(
  "https://jsonplaceholder.typicode.com/posts",
  { title: "Hello", body: "World", userId: 1 }
);

// Error handling
try {
  await HttpFacade.get("/not-found");
} catch (error) {
  console.error("Request failed:", error.message);
}`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Output Log ───────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Output</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="outline" onPress={() => setLogs([])}>
                Clear
              </Button>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <span className="text-muted">Send a request to see the response here...</span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className={entry.isError ? "text-danger" : "text-foreground"}>
                      {entry.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </section>
    </DefaultLayout>
  );
}
