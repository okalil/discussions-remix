# Discussions Mix

This project is a discussion web application (inspired by Github Discussions), designed with a clear architecture and modular code organization.
The purpose is to provide a reference implementation of a maintainable Remix 3 application.

## Shape

- `app/routes.ts` defines the route contract.
- `app/router.ts` wires routes to handlers.
- `app/core/` hosts the core application logic and integrations.
- `app/actions/` holds the routes handlers.
- `app/middleware/` holds reusable route middlewares.
- `app/ui/` holds the layout and ui components.

## Patterns and conventions

### Browser modules

Interactive components that require client-side JS (like a button with pending state) are typically defined with `clientEntry(import.meta.url, …)` inside a `*.browser.*` module so the client can load and hydrate them.

The `.browser` suffix marks **browser-loadable** modules, not “browser-only” code. The same module can be imported on the server (controllers), fetched by the browser via `<script />`, or imported by another browser module. Modules that don't use the suffix can only be used on the server-side.

### Form validation

One shared `FormValidator` over a `remix/data-schema` form schema is the contract between the form UI and the route action. `validate(formData)` returns either parsed `data` or an `errors` map and `getDraft()` to provide a serializable draft of partial form state.

**Client**: The component renders a native `<form method="post">`.

- `Form` manages form state and runs the shared validator client-side.
- `field` mixin binds controls, setting up initial state and live validation after first attempt.
- `submit` mixin coordinates progressively-enhanced submission handling.

**Server**: The route action reuses the same validator server-side. On failure it re-renders with the `errors` and `draft`, which is used to restore the `Form` state after a full page reload.

**Errors**: server errors are applied with `mergeState` on every render (either document or fetch responses), including failures only the server can determine (e.g. invalid credentials).

See `app/ui/auth/login.browser.tsx` and `app/actions/auth/login/controller.tsx`.

```tsx
// login.browser.tsx
export const loginValidator = new FormValidator(
  f.object({
    email: f.field(s.string().pipe(email())),
    password: f.field(s.string().pipe(minLength(8))),
  }),
);

export const LoginForm = clientEntry<LoginFormProps>(
  import.meta.url,
  function LoginForm(handle) {
    const form = new Form({
      validator: loginValidator,
      draft: handle.props.draft,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
    });

    return () => {
      form.mergeState({ errors: handle.props.errors });
      const { errors, pending } = form.state;
      return (
        <form method="post" mix={[styles.form, submit(form)]}>
          <Field label="Email" error={errors.email}>
            <Input mix={field(form, 'email')} type="email" />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input mix={field(form, 'password')} type="password" />
          </Field>
          {errors.root && <ErrorMessage error={errors.root} />}
          <Button type="submit" variant="primary" pending={pending}>
            Log in
          </Button>
        </form>
      );
    };
  },
);
```

```tsx
// login/controller.tsx (action)
const validation = loginValidator.validate(context.formData);
if (validation.errors) {
  return context.render(
    <LoginPage
      draft={validation.getDraft({ omit: ['password'] })}
      errors={validation.errors}
    />,
    { status: 422 },
  );
}
// …use validation.data, then redirect
```

## Commands

```sh
npm i
npm run start
npm test
npm run typecheck
```
