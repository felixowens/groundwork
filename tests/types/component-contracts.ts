import type { ButtonProps, InputProps, SelectProps, TextareaProps } from '../../src';

type HasKey<T, Key extends PropertyKey> = Key extends keyof T ? true : false;

type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;

type ButtonHasNoClassName = AssertFalse<HasKey<ButtonProps, 'className'>>;
type ButtonHasNoStyle = AssertFalse<HasKey<ButtonProps, 'style'>>;

type InputHasNoClassName = AssertFalse<HasKey<InputProps, 'className'>>;
type InputHasNoStyle = AssertFalse<HasKey<InputProps, 'style'>>;
type InputRequiresAccessibleName = AssertTrue<HasKey<InputProps, 'aria-label'> | HasKey<InputProps, 'aria-labelledby'>>;

type SelectHasNoClassName = AssertFalse<HasKey<SelectProps, 'className'>>;
type SelectHasNoStyle = AssertFalse<HasKey<SelectProps, 'style'>>;

type TextareaHasNoClassName = AssertFalse<HasKey<TextareaProps, 'className'>>;
type TextareaHasNoStyle = AssertFalse<HasKey<TextareaProps, 'style'>>;

export type ComponentContractAssertions =
  | ButtonHasNoClassName
  | ButtonHasNoStyle
  | InputHasNoClassName
  | InputHasNoStyle
  | InputRequiresAccessibleName
  | SelectHasNoClassName
  | SelectHasNoStyle
  | TextareaHasNoClassName
  | TextareaHasNoStyle;
