import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import type { User } from '../../core/user.types.ts';
import { Avatar } from '../shared/avatar.tsx';
import { Button } from '../shared/button.tsx';
import { ErrorMessage } from '../shared/error-message.tsx';
import { FileField, TextField } from '../shared/field.tsx';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ProfileFormProps = {
  user: User;
  draft?: FormDraft;
  errors?: FormErrors;
};

export const ProfileForm = clientEntry<ProfileFormProps>(
  import.meta.url,
  function ProfileForm(handle) {
    const profileForm = new Form({
      method: 'post',
      schema: updateProfileSchema,
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });
    addEventListeners(profileForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    let previewUrl: string | undefined;
    handle.signal.addEventListener('abort', () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    });

    const imageField = profileForm.field('image');
    addEventListeners(imageField, handle.signal, {
      change() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const file = imageField.value;
        previewUrl = file?.size ? URL.createObjectURL(file) : undefined;

        handle.update();
      },
    });

    return () => {
      const { errors, pending } = profileForm.state;

      const user = handle.props.user;
      const userImage = previewUrl ?? user.image;

      return (
        <form
          encType="multipart/form-data"
          mix={[styles.form, form(profileForm, { replace: true })]}
        >
          <label mix={styles.avatarField}>
            <Avatar
              src={userImage}
              alt={user.name}
              size={64}
              fallback={user.name.at(0)}
            />
            <FileField field={imageField} accept="image/*" />
            {errors.image && (
              <span mix={styles.imageError}>{errors.image}</span>
            )}
          </label>

          <TextField
            field={profileForm.field('name')}
            label="Name"
            type="text"
            aria-required
          />

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Save
          </Button>
        </form>
      );
    };
  },
);

export const updateProfileSchema = f.object({
  name: f.field(s.string().pipe(minLength(1))),
  image: f.file(
    s
      .optional(s.instanceof_(File))
      .transform((file) => {
        if (!file?.size || !file.name) return undefined;
        return file;
      })
      .refine(
        (file) => file === undefined || file.size <= MAX_IMAGE_BYTES,
        'Image must be less than 5MB',
      ),
  ),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '0.75rem',
  }),
  avatarField: css({
    display: 'grid',
    placeItems: 'center',
    marginBottom: '0.25rem',
    cursor: 'pointer',
  }),
  imageError: css({
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    textAlign: 'center',
    color: '#dc2626',
  }),
  submit: css({
    height: '3rem',
    width: '10rem',
    marginLeft: 'auto',
    marginTop: '0.5rem',
  }),
};
