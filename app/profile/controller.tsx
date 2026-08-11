import { toDraft, toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { requireAuth } from '../middleware/auth.ts';
import { routes } from '../routes.ts';
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

      const data = validation.value;
      const avatar = data.avatar
        ? await userService.uploadUserAvatar(user.id, data.avatar)
        : undefined;
      await userService.updateUser(user.id, data.name, avatar);

      session.flash('success', 'Successfully updated!');
      return redirect(routes.profile.index.href());
    },
  },
});
