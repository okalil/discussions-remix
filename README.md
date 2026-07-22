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

A shared `remix/data-schema` form schema is the contract between the form UI and the route action. The client and server both validate with that schema; helpers map failures into form-friendly `errors` and serializable `draft` state.

**Client**: the component renders a native `<form method="post">`.

- `Form` manages form state and runs the shared schema client-side.
- `field` mixin binds controls, setting up initial state and live validation after first attempt.
- `form` mixin binds the form element and coordinates progressively-enhanced submission handling.

**Server**: the route action validates with the same schema server-side. On failure it re-renders with `toErrors(issues)` and `toDraft(formData)`, which is used to restore `Form` values after a full page reload.

**Errors**: server errors are applied with `mergeState` on every render (either document or fetch responses), including failures only the server can determine (e.g. invalid credentials).

See `app/ui/auth/login-form.browser.tsx` and `app/actions/auth/login/controller.tsx`.

```tsx
// login-form.browser.tsx
export const loginSchema = f.object({
  email: f.field(s.string().pipe(email())),
  password: f.field(s.string().pipe(minLength(8))),
});

export const LoginForm = clientEntry<LoginFormProps>(
  import.meta.url,
  function LoginForm(handle) {
    const loginForm = new Form({
      method: 'post',
      schema: loginSchema,
      draft: handle.props.draft,
    });
    addEventListeners(loginForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      loginForm.mergeState({ errors: handle.props.errors });
      const { errors, pending } = loginForm.state;
      return (
        <form mix={[styles.form, form(loginForm)]}>
          <Field label="Email" error={errors.email}>
            <Input mix={field(loginForm, 'email')} type="email" />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input mix={field(loginForm, 'password')} type="password" />
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
const validation = parseSafe(loginSchema, context.formData);
if (!validation.success) {
  return context.render(
    <LoginLayout>
      <LoginForm
        draft={toDraft(context.formData, { omit: ['password'] })}
        errors={toErrors(validation.issues)}
      />
    </LoginLayout>,
    { status: 422 },
  );
}
// …use validation.value, then redirect
```

## Commands

```sh
npm i
npm run start
npm test
npm run typecheck
```
