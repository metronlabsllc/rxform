import { Provider, matchfield } from "@datatypes/Provider";
import {
  Option,
  concat as optionconcat,
  none,
  from,
  match,
  is,
  some
} from "@datatypes/Option";
import { $el, string } from "@util/operators";
import { Msg, FormFieldEvent } from "@/events";
import { FormEventType, FormFieldRepository, FormValues } from "@util/types";
import {
  FormFieldValueObject,
  create as getfieldvalue
} from "@datatypes/Field";

import { FORM_FIELD_TAG } from "@/config";

export type TouchedFormFields = Set<string>;

export interface Form {
  $form: Option<HTMLFormElement>;
  providers: Map<string, Provider>;
  touched: TouchedFormFields;
  // onsubmit: <T, K>(values: T, ...actions: K[]) => void;
  // onreset: <T, K>(values: T, ...actions: K[]) => void;
}

export const base: Form = {
  $form: none as Option<HTMLFormElement>,
  providers: new Map<string, Provider>(),
  touched: new Set<string>()
};

export const $getform = (f: Option<Form>): Option<HTMLFormElement> => {
  return match(
    () => none as Option<HTMLFormElement>,
    (value: Form) => value.$form
  )(f);
};

export const concat = (x: Form, y: Partial<Form>): Form => {
  const $form = optionconcat(x.$form, y.$form ? y.$form : none);
  const providers = new Map<string, Provider>();

  Array.from(x.providers.entries()).forEach(([name, provider]) => {
    providers.set(name, provider);
  });

  if (y.providers instanceof Map) {
    Array.from(y.providers.entries()).forEach(([name, provider]) => {
      providers.set(name, provider);
    });
  }

  const touched = new Set<string>();
  Array.from(x.touched.values()).forEach((name) => {
    touched.add(name);
  });

  if (y.touched instanceof Set) {
    Array.from(y.touched.values()).forEach((name) => {
      touched.add(name);
    });
  }

  return {
    $form,
    providers,
    touched
  };
};

export const create = (formid: string): Option<Form> => {
  const $form = $el.$form(formid);
  return from.nullable(concat(base, { $form }));
};

export const router = (
  form: Form,
  formfields: FormFieldRepository<Map<string, Set<string>>>,
  msg: Option<Msg>
): Map<string, Provider> => {
  const providers = new Map<string, Provider>();
  if (is.none(msg)) {
    return providers;
  }

  const eventtype = string.is.nonempty(msg.value.type)
    ? (some(msg.value.type.trim()) as Option<FormEventType>)
    : msg.value.type;

  if (is.none(eventtype)) {
    return providers;
  }

  const fieldname = msg.value instanceof FormFieldEvent ? msg.value.name : none;
  const store = formfields.get();
  for (const [providername, provider] of form.providers.entries()) {
    const fieldset = store.get(providername);
    if (is.some(fieldname) && fieldset && fieldset.has(fieldname.value)) {
      providers.set(providername, provider);
      continue;
    }

    is.some(fieldname) &&
      matchfield(provider, eventtype.value, fieldname) &&
      providers.set(providername, provider);
  }

  is.some(fieldname) &&
    providers.size &&
    formfields.set([...providers.keys()], fieldname.value);

  return providers;
};

export function getformvalues(
  $form: Option<HTMLFormElement>
): Map<string, Readonly<FormFieldValueObject>> {
  return match(
    () => new Map<string, Readonly<FormFieldValueObject>>(),
    (_$form: HTMLFormElement) => {
      return Array.from(_$form.elements).reduce(
        (values: FormValues, element: Element) => {
          if ($el.is.field(element)) {
            const value = getfieldvalue(some(_$form), some(element));
            if (value.tag !== FORM_FIELD_TAG.NIL) {
              return values.set(value.name, Object.freeze(value));
            }
            return values;
          }
          return values;
        },
        new Map<string, Readonly<FormFieldValueObject>>()
      );
    }
  )($form);
}
