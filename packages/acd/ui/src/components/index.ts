/**
 * @fileoverview Barrel export for all components.
 * @module components
 */

// ─── HeroUI Re-exports ────────────────────────────────────────────
// All HeroUI components are re-exported here so consumers import from
// @stackra/ts-ui instead of @heroui/react directly.
export {
  Accordion,
  Alert,
  AlertDialog,
  Autocomplete,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  CloseButton,
  ComboBox,
  DateField,
  DatePicker,
  DateRangePicker,
  Description,
  Disclosure,
  DisclosureGroup,
  Drawer as HeroDrawer,
  Dropdown,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  InputOTP,
  Kbd,
  Label,
  Link,
  ListBox,
  Meter,
  Modal,
  NumberField,
  Pagination,
  Popover,
  ProgressBar,
  ProgressCircle,
  RadioGroup,
  RangeCalendar,
  ScrollShadow,
  SearchField,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Surface,
  Switch,
  Table,
  Tabs,
  TagGroup,
  TextArea,
  TextField,
  TimeField,
  Toast,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
} from '@heroui/react';

// ─── Slot ──────────────────────────────────────────────────────────
export { Slot } from './slot';
export type { SlotProps } from './slot';

// ─── Drawer Stack ──────────────────────────────────────────────────
export {
  DrawerContainer,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
  DrawerFooter,
  DrawerSubHeader,
  DrawerStepper,
  DrawerSection,
  DrawerDivider,
  DrawerLoading,
  DrawerAlert,
  DrawerToolbar,
  DrawerEmpty,
  ScopedSlot,
  Drawer,
  SubViewNavigator,
  StackDots,
} from './drawer-stack';
export type {
  DrawerContentProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerSubHeaderProps,
  DrawerStepperProps,
  DrawerStepperStep,
  DrawerSectionProps,
  DrawerDividerProps,
  DrawerToolbarProps,
  ScopedSlotProps,
} from './drawer-stack';

// ─── Command Dock ──────────────────────────────────────────────────
export {
  DockContainer,
  DockBar,
  DockMenu,
  DockButton,
  DockPrimaryCTA,
  DockSeparator,
  Dock,
} from './command-dock';
export type { DockPrimaryCTAProps, DockSeparatorProps } from './command-dock';
