# Discussions Mix

This project is a discussion web application (inspired by Github Discussions), designed with a clear architecture and modular code organization.
The purpose is to provide a reference implementation of a maintainable Remix 3 application.

## Shape

- `app/` is the web layer: routes, middleware, controllers, and UI.
- `core/` hosts the domain logic and integrations.

## Patterns and conventions

### Form validation

A shared `remix/data-schema` form schema is the contract between the form UI and the route action. The client and server both validate with that schema; helpers map failures into form-friendly `errors` and serializable `draft` state.

**Client**: the component renders a native `<form method="post">`.

- `Form` manages form state and runs the shared schema client-side.
- `form` mixin binds the form element and coordinates progressively-enhanced submission handling.
- `draft` and `errors` are always getters so Form reads live server props instead of values snapshotted at construction. That keeps defaults/errors in sync after frame replaces.

**Server**: the route action validates with the same schema server-side. On failure it re-renders with `toErrors(issues)` and `toDraft(formData)`, which is used to restore `Form` values after a full page reload.

**Errors**: the `errors` getter covers failures only the server can determine (e.g. invalid credentials). Client validation errors live in Form state and are merged with server errors.

See `app/auth/login/login-form.tsx` and `app/auth/login/controller.tsx`.

```tsx
// login-form.tsx
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
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });

    addEventListeners(loginForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      const { errors, pending } = loginForm.state;
      return (
        <form mix={[styles.form, form(loginForm)]}>
          <TextField
            field={loginForm.field('email')}
            label="Email"
            type="email"
          />
          <TextField
            field={loginForm.field('password')}
            label="Password"
            type="password"
          />
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
pnpm i
vp run dev
```

`vp run dev` applies Remix migrations, then starts the Vite dev server. Set `DATABASE_URL` in `.env` first.

### Database

The app talks to [Neon](https://neon.com) over the serverless driver (no Hyperdrive). Local development uses [Neon database branches](https://neon.com/guides/local-development-with-neon), not Docker Postgres.

```sh
# once per machine
neon auth

# once per working copy / feature
neon branches create --name dev/your-name
neon connection-string dev/your-name

# put the printed URL in .env as DATABASE_URL, then:
vp run db:migrate
vp run db:status
```

Reset a branch to match its parent instead of wiping Postgres:

```sh
neon branches reset dev/your-name
vp run db:migrate
```

`remix.json` points `remix db` at `DATABASE_URL`. Production: `wrangler secret put DATABASE_URL` with the Neon (pooled) connection string.
