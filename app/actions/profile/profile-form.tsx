import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import { css } from 'pitlane/theme';
import { clientEntry } from 'remix/component';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';

import type { User } from '../../../core/user.types.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { Button } from '../../shared/button.tsx';
import { ErrorMessage } from '../../shared/error-message.tsx';
import { FileField } from '../../shared/forms/file-field.tsx';
import { TextField } from '../../shared/forms/text-field.tsx';
import { t } from '../../theme.ts';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

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
    const avatarField = profileForm.field('avatar');

    let previewUrl: string | null = null;

    function onAvatarChange() {
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const file = avatarField.value;
      previewUrl = file?.size ? URL.createObjectURL(file) : null;

      handle.update();
    }

    profileForm.addEventListener('statechange', handle.update);
    avatarField.addEventListener('change', onAvatarChange);

    handle.signal.addEventListener('abort', () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    });

    return () => {
      const { errors, pending } = profileForm.state;

      const user = handle.props.user;
      const userAvatar = previewUrl ?? user.avatar;

      return (
        <form
          encType="multipart/form-data"
          mix={[styles.form, form(profileForm, { history: 'replace' })]}
        >
          <div mix={styles.photoSection}>
            <label mix={styles.photo}>
              <span aria-hidden="true">
                <Avatar
                  src={userAvatar}
                  alt=""
                  size={80}
                  fallback={user.name.at(0)}
                />
              </span>
              <span mix={styles.photoCopy}>
                <span mix={styles.photoAction}>Change photo</span>
                <span mix={styles.photoHint}>Images up to 5MB.</span>
              </span>
              <FileField field={avatarField} accept="image/*" />
            </label>
            {errors.avatar && (
              <span mix={styles.avatarError}>{errors.avatar}</span>
            )}
          </div>

          <TextField
            field={profileForm.field('name')}
            label="Name"
            type="text"
            aria-required
          />

          <div>
            <span mix={styles.label}>Email</span>
            <p mix={styles.email}>{user.email}</p>
          </div>

          {errors.root && <ErrorMessage error={errors.root} />}

          <div mix={styles.actions}>
            <Button type="submit" variant="primary" pending={pending}>
              Save changes
            </Button>
          </div>
        </form>
      );
    };
  },
);

export const updateProfileSchema = f.object({
  name: f.field(s.string().pipe(minLength(1))),
  avatar: f.file(
    s
      .optional(s.instanceof_(File))
      .transform((file) => {
        if (!file?.size || !file.name) return null;
        return file;
      })
      .refine(
        (file) => !file || file.size <= MAX_AVATAR_BYTES,
        'Avatar must be less than 5MB',
      ),
  ),
});

const styles = {
  form: css({
    display: 'grid',
    gap: t.spacing(5),
  }),
  photoSection: css({
    display: 'grid',
    gap: t.spacing(2),
    paddingBottom: t.spacing(5),
    borderBottom: `${t.size.px} solid ${t.color.outlineVariant}`,
  }),
  photo: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(4),
    width: 'fit-content',
    cursor: 'pointer',
    '&:hover > span > span:first-child': {
      textDecoration: 'underline',
    },
  }),
  photoCopy: css({
    display: 'grid',
    gap: t.spacing(0.5),
  }),
  photoAction: css({
    fontSize: t.type.labelLarge.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.primary,
  }),
  photoHint: css({
    fontSize: t.type.bodySmall.size,
    color: t.color.onSurfaceVariant,
  }),
  avatarError: css({
    fontSize: t.type.bodyMedium.size,
    color: t.color.error,
  }),
  label: css({
    display: 'block',
    marginBottom: t.spacing(1),
    fontSize: t.type.labelLarge.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.onSurfaceVariant,
  }),
  email: css({
    margin: 0,
    padding: [t.spacing(2), t.spacing(3)],
    borderRadius: t.shape.extraSmall,
    backgroundColor: t.color.surfaceContainer,
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'flex-end',
  }),
};
