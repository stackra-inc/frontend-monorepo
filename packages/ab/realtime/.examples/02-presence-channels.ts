/**
 * Presence Channels Example
 *
 * |--------------------------------------------------------------------------
 * | @stackra/ts-realtime — Presence Channels
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates presence channel member tracking:
 * | - Joining a presence channel
 * | - here() — initial member list
 * | - joining() — member join events
 * | - leaving() — member leave events
 * | - getMembers() — current member snapshot
 * | - Multiple presence channels
 * | - Leaving and cleanup
 * |
 * | Presence channels extend private channels with member awareness.
 * | They require authentication and track who is currently subscribed.
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a WebSocket server (Soketi/Pusher).
 * |
 * | @example
 * | ```bash
 * | npx ts-node .examples/02-presence-channels.ts
 * | ```
 * |
 */

import {
  RealtimeModule,
  RealtimeManager,
  REALTIME_MANAGER,
} from "@stackra/ts-realtime";
import type { PresenceChannelWrapper } from "@stackra/ts-realtime";

// ─── Type Definitions ───────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface ChatMessage {
  userId: number;
  text: string;
  timestamp: number;
}

// ─── Example 1: Joining a Presence Channel ──────────────────────────────────
//
// manager.join(name) subscribes to a presence channel.
// Returns a PresenceChannelWrapper with member tracking methods.
//

function joiningPresenceChannel() {
  console.log("\n=== Example 1: Joining a Presence Channel ===\n");

  /*
  |--------------------------------------------------------------------------
  | Presence channels — member-aware subscriptions.
  |--------------------------------------------------------------------------
  |
  | manager.join(name) returns a PresenceChannelWrapper that extends
  | ChannelWrapper with:
  |   - here<T>(callback) — initial member list
  |   - joining<T>(callback) — member join events
  |   - leaving<T>(callback) — member leave events
  |   - getMembers<T>() — current member snapshot
  |
  | The channel name should NOT include the 'presence-' prefix —
  | Laravel Echo adds it automatically.
  |
  | All callbacks support method chaining for fluent API usage.
  |
  */
  console.log("  // Join a presence channel:");
  console.log('  const presence = manager.join("chat-room.1");');
  console.log("");
  console.log("  // Register member tracking callbacks:");
  console.log("  presence");
  console.log("    .here<User>((members) => {");
  console.log("      // Called once with the initial member list");
  console.log('      console.log("Currently online:", members.length);');
  console.log("      members.forEach(m => console.log(`  - ${m.name}`));");
  console.log("    })");
  console.log("    .joining<User>((member) => {");
  console.log("      // Called when a new member joins");
  console.log("      console.log(`${member.name} joined the room`);");
  console.log("    })");
  console.log("    .leaving<User>((member) => {");
  console.log("      // Called when a member leaves");
  console.log("      console.log(`${member.name} left the room`);");
  console.log("    });");
  console.log("");
  console.log("  ✓ Presence channel join demonstrated");
}

// ─── Example 2: Member Tracking with getMembers() ──────────────────────────
//
// getMembers() returns a snapshot of the current member list.
// The internal list is updated BEFORE callbacks fire.
//

function memberTracking() {
  console.log("\n=== Example 2: Member Tracking with getMembers() ===\n");

  /*
  |--------------------------------------------------------------------------
  | getMembers() — current member snapshot.
  |--------------------------------------------------------------------------
  |
  | The PresenceChannelWrapper maintains an internal members array.
  | It's updated BEFORE your callbacks are invoked, so getMembers()
  | always returns the current state inside any callback.
  |
  | Returns a shallow copy to prevent external mutation.
  |
  */
  console.log('  const presence = manager.join("chat-room.1");');
  console.log("");
  console.log("  presence");
  console.log("    .here<User>((members) => {");
  console.log("      // getMembers() returns the same list inside here()");
  console.log("      const current = presence.getMembers<User>();");
  console.log('      console.log("Members:", current.length);');
  console.log("    })");
  console.log("    .joining<User>((member) => {");
  console.log("      // New member is already in the list");
  console.log("      const current = presence.getMembers<User>();");
  console.log(
    "      console.log(`${member.name} joined. Total: ${current.length}`);",
  );
  console.log("    })");
  console.log("    .leaving<User>((member) => {");
  console.log("      // Departed member is already removed");
  console.log("      const current = presence.getMembers<User>();");
  console.log(
    "      console.log(`${member.name} left. Total: ${current.length}`);",
  );
  console.log("    });");
  console.log("");
  console.log("  ✓ Member tracking demonstrated");
}

// ─── Example 3: Presence + Event Listening ──────────────────────────────────
//
// PresenceChannelWrapper extends ChannelWrapper, so you can also
// listen for broadcast events on presence channels.
//

function presenceWithEvents() {
  console.log("\n=== Example 3: Presence + Event Listening ===\n");

  /*
  |--------------------------------------------------------------------------
  | Presence channels support event listening too.
  |--------------------------------------------------------------------------
  |
  | Since PresenceChannelWrapper extends ChannelWrapper, you get
  | all the event listening capabilities:
  |   - listen<T>(event, callback)
  |   - stopListening(event)
  |   - onError(callback)
  |
  | This is useful for chat rooms where you need both member tracking
  | AND message events on the same channel.
  |
  */
  console.log('  const presence = manager.join("chat-room.1");');
  console.log("");
  console.log("  // Track members:");
  console.log("  presence");
  console.log("    .here<User>((members) => setOnlineUsers(members))");
  console.log("    .joining<User>((member) => addUser(member))");
  console.log("    .leaving<User>((member) => removeUser(member));");
  console.log("");
  console.log("  // AND listen for broadcast events:");
  console.log("  presence");
  console.log('    .listen<ChatMessage>(".message.sent", (msg) => {');
  console.log("      console.log(`[${msg.userId}]: ${msg.text}`);");
  console.log("    })");
  console.log('    .listen<{ userId: number }>(".user.typing", (data) => {');
  console.log("      console.log(`User ${data.userId} is typing...`);");
  console.log("    })");
  console.log("    .onError((err) => {");
  console.log('      console.error("Channel error:", err.message);');
  console.log("    });");
  console.log("");
  console.log("  ✓ Presence + events demonstrated");
}

// ─── Example 4: Multiple Presence Channels ──────────────────────────────────
//
// You can join multiple presence channels simultaneously.
// Each channel has its own member list and callbacks.
//

function multiplePresenceChannels() {
  console.log("\n=== Example 4: Multiple Presence Channels ===\n");

  /*
  |--------------------------------------------------------------------------
  | Multiple presence channels — independent member tracking.
  |--------------------------------------------------------------------------
  |
  | Each presence channel maintains its own member list.
  | The manager tracks all active presence channels internally.
  |
  | Calling join() with the same name returns the existing wrapper
  | (no duplicate subscriptions).
  |
  */
  console.log("  // Join multiple presence channels:");
  console.log('  const chatRoom = manager.join("chat-room.1");');
  console.log('  const videoCall = manager.join("video-call.42");');
  console.log('  const dashboard = manager.join("dashboard.admin");');
  console.log("");
  console.log("  // Each has independent member tracking:");
  console.log("  chatRoom.here<User>((members) => {");
  console.log('    console.log("Chat members:", members.length);');
  console.log("  });");
  console.log("");
  console.log("  videoCall.here<User>((members) => {");
  console.log('    console.log("Video participants:", members.length);');
  console.log("  });");
  console.log("");
  console.log("  dashboard.here<User>((members) => {");
  console.log('    console.log("Dashboard viewers:", members.length);');
  console.log("  });");
  console.log("");
  console.log("  // Joining the same channel returns the existing wrapper:");
  console.log('  const sameRoom = manager.join("chat-room.1");');
  console.log("  // sameRoom === chatRoom (same reference)");
  console.log("");
  console.log("  ✓ Multiple presence channels demonstrated");
}

// ─── Example 5: Leaving Presence Channels ───────────────────────────────────
//
// leave() unsubscribes from the presence channel and clears member tracking.
//

function leavingPresenceChannels() {
  console.log("\n=== Example 5: Leaving Presence Channels ===\n");

  /*
  |--------------------------------------------------------------------------
  | Leaving — cleanup and resource release.
  |--------------------------------------------------------------------------
  |
  | leave() on a PresenceChannelWrapper:
  |   1. Notifies the server that you're leaving
  |   2. Removes the channel from the manager's tracking map
  |   3. Marks the wrapper as "left" (subsequent listen() calls throw)
  |
  | Other members will receive a leaving() callback for your user.
  |
  */
  console.log('  const presence = manager.join("chat-room.1");');
  console.log("");
  console.log("  // ... use the channel ...");
  console.log("");
  console.log("  // Leave when done:");
  console.log("  presence.leave();");
  console.log("");
  console.log("  // After leave:");
  console.log("  //   - Other members see you leave");
  console.log("  //   - presence.isLeft === true");
  console.log("  //   - presence.listen() throws");
  console.log("  //   - presence.getMembers() returns []");
  console.log("");
  console.log("  // Disconnect clears ALL channels:");
  console.log("  manager.disconnect();");
  console.log("  // All channels and presence channels are cleaned up");
  console.log("");
  console.log("  ✓ Leaving demonstrated");
}

// ─── Run All Examples ───────────────────────────────────────────────────────

function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Realtime — Presence Channels         ║");
  console.log("╚════════════════════════════════════════╝");

  joiningPresenceChannel();
  memberTracking();
  presenceWithEvents();
  multiplePresenceChannels();
  leavingPresenceChannels();

  console.log("\n✅ All examples completed successfully!\n");
}

main();
