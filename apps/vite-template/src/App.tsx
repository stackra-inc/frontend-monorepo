/**
 * Application Root Component
 *
 * Defines all client-side routes using react-router-dom v7.
 * Each route maps a URL path to a page component.
 *
 * @module App
 */

import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import DemosPage from "@/pages/demos/index";
import TsContainerDemo from "@/pages/demos/ts-container";
import TsSupportDemo from "@/pages/demos/ts-support";
import TsCacheDemo from "@/pages/demos/ts-cache";
import TsConfigDemo from "@/pages/demos/ts-config";
import TsEventsDemo from "@/pages/demos/ts-events";
import TsHttpDemo from "@/pages/demos/ts-http";
import TsRedisDemo from "@/pages/demos/ts-redis";
import TsLoggerDemo from "@/pages/demos/ts-logger";
import ReactI18nDemo from "@/pages/demos/react-i18n";
import TsRealtimeDemo from "@/pages/demos/ts-realtime";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<DemosPage />} path="/demos" />
      <Route element={<TsContainerDemo />} path="/demos/ts-container" />
      <Route element={<TsSupportDemo />} path="/demos/ts-support" />
      <Route element={<TsCacheDemo />} path="/demos/ts-cache" />
      <Route element={<TsConfigDemo />} path="/demos/ts-config" />
      <Route element={<TsEventsDemo />} path="/demos/ts-events" />
      <Route element={<TsHttpDemo />} path="/demos/ts-http" />
      <Route element={<TsRedisDemo />} path="/demos/ts-redis" />
      <Route element={<TsLoggerDemo />} path="/demos/ts-logger" />
      <Route element={<ReactI18nDemo />} path="/demos/react-i18n" />
      <Route element={<TsRealtimeDemo />} path="/demos/ts-realtime" />
    </Routes>
  );
}

export default App;
