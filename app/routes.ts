import { del, form, get, post, put, route } from 'remix/routes';

export const routes = route({
  uploads: {
    index: get('/uploads/*key'),
  },

  auth: route('/auth', {
    login: form('/login'),
    register: form('/register'),
    forgotPassword: form('/forgot-password'),
    resetPassword: form('/reset-password'),
    social: {
      start: post('/social/:provider'),
      finish: get('/social/:provider'),
    },
    logout: post('/logout'),
  }),

  discussions: {
    index: '/(categories/:category)',
    new: form('/discussions/new'),
    show: '/discussions/:id',
    vote: post('/discussions/:id/vote'),
    preview: '/discussions/:id/preview',
  },

  comments: {
    index: '/discussions/:discussionId/comments',
    new: post('/discussions/:discussionId/comments/new'),
    edit: put('/comments/:id'),
    destroy: del('/comments/:id'),
    vote: post('/comments/:id/vote'),
  },

  profile: form('/profile'),
});
