import { form, get, post, route } from 'remix/routes';

export const routes = route({
  assets: get('/assets/*path'),
  uploads: get('/uploads/*key'),

  auth: {
    login: form('/auth/login'),
    register: form('/auth/register'),
    forgotPassword: form('/auth/forgot-password'),
    resetPassword: form('/auth/reset-password'),
    social: {
      start: post('/auth/social/:provider'),
      finish: get('/auth/social/:provider'),
    },
    logout: post('/auth/logout'),
  },

  discussions: {
    index: '/(categories/:category)',
    new: form('/discussions/new'),
    vote: post('/discussions/:id/vote'),
    hovercard: get('/discussions/:id/hovercard'),
    show: {
      index: '/discussions/:id',
      comments: get('/discussions/:id/comments'),
      participants: get('/discussions/:id/participants'),
    },
  },

  comments: {
    new: post('/discussions/:discussionId/comments/new'),
    edit: post('/comments/:id/edit'),
    delete: post('/comments/:id/delete'),
    vote: post('/comments/:id/vote'),
  },

  profile: form('/profile'),
});
