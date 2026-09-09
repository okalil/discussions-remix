import { toDraft, toErrors } from '@discussions/form';
import { createController } from '@discussions/router';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';

import { requireAuth } from '../../middleware/auth.ts';
import { routes } from '../../routes.ts';
import { ProfileForm, updateProfileSchema } from './profile-form.tsx';
import { ProfileLayout } from './profile-layout.tsx';

export default createController(routes.profile, {
  middleware: [requireAuth()],
  actions: {
    async index({ render, auth }) {
      const user = auth.identity;
      return render(
        <ProfileLayout>
          <ProfileForm user={user} draft={[['name', user.name]]} />
        </ProfileLayout>,
      );
    },
    async action({ render, formData, auth, session, userService }) {
      const user = auth.identity;
      const validation = parseSafe(updateProfileSchema, formData);
      if (!validation.success) {
        return render(
          <ProfileLayout>
            <ProfileForm
              user={user}
              draft={toDraft(formData)}
              errors={toErrors(validation.issues)}
            />
          </ProfileLayout>,
          { status: 422 },
        );
      }

      await userService.updateUser(user.id, {
        name: validation.value.name,
        avatar: validation.value.avatar,
      });

      session.flash('success', 'Successfully updated!');
      return redirect(routes.profile.index.href());
    },
  },
});
