'use client';

import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Group, Box, Title, Paper } from '@mantine/core';

export default function HomePage() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 chars' : null),
    },
  });

  return (
    <Box maw={400} mx="auto" mt={100}>
      <Paper shadow="xs" radius="sm" p="xl" withBorder>
      <Title order={2} mb="md" ta="center">Login</Title>
      
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <TextInput 
          radius="sm"
          label="Email" 
          placeholder="you@example.com" 
          {...form.getInputProps('email')} 
        />
        
        <PasswordInput
          radius="sm" 
          label="Password" 
          placeholder="Your password" 
          mt="md" 
          {...form.getInputProps('password')} 
        />
        
        <Group justify="flex-end" mt="xl">
          <Button radius="sm" type="submit">Login</Button>
        </Group>
      </form>
      </Paper>
    </Box>

  );
}