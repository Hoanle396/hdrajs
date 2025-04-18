import { createApp } from './core';
import './user.controller';
import './user.service';

const app = createApp();

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
})