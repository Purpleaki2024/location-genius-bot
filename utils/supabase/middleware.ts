import { supabaseServerClient } from './server';

export const middleware = async (req, res, next) => {
  try {
    const { data, error } = await supabaseServerClient.auth.getUser();
    if (error) {
      throw error;
    }
    req.user = data;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};
