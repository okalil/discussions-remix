import { toDraft, toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { requireAuth } from '../../middleware/auth.ts';
import { routes } from '../../routes.ts';
import { ProfileLayout } from '../../ui/profile/profile-layout.tsx';
import {
  ProfileForm,
  updateProfileSchema,
} from '../../ui/profile/public/profile-form.tsx';

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
      const fileKey = await userService.uploadUserImage(user.id, data.image);
      await userService.updateUser(user.id, data.name, fileKey);

      session.flash('success', 'Successfully updated!');
      return redirect(routes.profile.index.href());
    },
  },
});
