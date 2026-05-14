import type { ComponentProps } from 'react';
import type * as PublicApi from '../../src';
import type {
  BannerProps,
  CheckboxGroupProps,
  InputProps,
  RadioGroupProps,
  SelectProps,
  SummaryListAction,
  SummaryListProps,
  TextareaProps,
} from '../../src';

type HasKey<T, Key extends PropertyKey> = Key extends keyof T ? true : false;
type IsRequired<T, Key extends keyof T> = Record<string, never> extends Pick<T, Key> ? false : true;

type AssertTrue<T extends true> = T;
type AssertNever<T extends never> = T;

type ExportedComponentName = {
  [Key in keyof typeof PublicApi]: Key extends Capitalize<Key & string> ? Key : never;
}[keyof typeof PublicApi];

const componentContractCoverage = {
  Banner: true,
  Button: true,
  CheckboxGroup: true,
  ErrorSummary: true,
  Field: true,
  Input: true,
  RadioGroup: true,
  Select: true,
  SummaryList: true,
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
type RadioGroupRequiresLegend = AssertTrue<HasKey<RadioGroupProps, 'legend'>>;
type CheckboxGroupRequiresLegend = AssertTrue<HasKey<CheckboxGroupProps, 'legend'>>;
type BannerRequiresTitle = AssertTrue<IsRequired<BannerProps, 'title'>>;
type SummaryListRequiresRows = AssertTrue<IsRequired<SummaryListProps, 'rows'>>;
type SummaryListActionRequiresHiddenText = AssertTrue<
  SummaryListAction extends { visuallyHiddenText: string } ? true : false
>;

type CoverageIncludesAllExportedComponents = typeof componentContractCoverage;

export type ComponentContractAssertions =
  | CoverageIncludesAllExportedComponents
  | NoExportedComponentAcceptsStyleOverrides
  | InputRequiresAccessibleName
  | SelectRequiresAccessibleName
  | TextareaRequiresAccessibleName
  | RadioGroupRequiresLegend
  | CheckboxGroupRequiresLegend
  | BannerRequiresTitle
  | SummaryListRequiresRows
  | SummaryListActionRequiresHiddenText;
