import type { ComponentProps } from 'react';
import type * as PublicApi from '../../src';
import type { InputProps, SelectProps, TextareaProps } from '../../src';

type HasKey<T, Key extends PropertyKey> = Key extends keyof T ? true : false;

type AssertTrue<T extends true> = T;
type AssertNever<T extends never> = T;

type ExportedComponentName = {
  [Key in keyof typeof PublicApi]: Key extends Capitalize<Key & string> ? Key : never;
}[keyof typeof PublicApi];

const componentContractCoverage = {
  Button: true,
  ErrorSummary: true,
  Field: true,
  Input: true,
  Select: true,
  Textarea: true,
} satisfies Record<ExportedComponentName, true>;

type StyleOverrideViolations = {
  [Key in ExportedComponentName]: HasKey<ComponentProps<(typeof PublicApi)[Key]>, 'className'> extends true
    ? Key
    : HasKey<ComponentProps<(typeof PublicApi)[Key]>, 'style'> extends true
      ? Key
      : never;
}[ExportedComponentName];

type NoExportedComponentAcceptsStyleOverrides = AssertNever<StyleOverrideViolations>;

type InputRequiresAccessibleName = AssertTrue<HasKey<InputProps, 'aria-label'> | HasKey<InputProps, 'aria-labelledby'>>;
type SelectRequiresAccessibleName = AssertTrue<
  HasKey<SelectProps, 'aria-label'> | HasKey<SelectProps, 'aria-labelledby'>
>;
type TextareaRequiresAccessibleName = AssertTrue<
  HasKey<TextareaProps, 'aria-label'> | HasKey<TextareaProps, 'aria-labelledby'>
>;

type CoverageIncludesAllExportedComponents = typeof componentContractCoverage;

export type ComponentContractAssertions =
  | CoverageIncludesAllExportedComponents
  | NoExportedComponentAcceptsStyleOverrides
  | InputRequiresAccessibleName
  | SelectRequiresAccessibleName
  | TextareaRequiresAccessibleName;
