import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import { Button, Card, Input, Stack, Text } from "@zeno-site/react";

const meta = {
  title: "Zeno UI/Primitives",
  component: Button,
  decorators: [
    (Story) => (
      <div className="zeno-preview min-w-[720px] rounded-card bg-background p-6 text-text">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PrimitiveSet: Story = {
  render: () => (
    <Stack gap="$4">
      <Stack gap="$2">
        <Text size="title" weight="semibold">Five primitive system</Text>
        <Text tone="muted">Stack, Text, Button, Input, and Card compose the first Zeno UI surface.</Text>
      </Stack>
      <Card variant="glass">
        <Card.Header>
          <Stack gap="$2">
            <Text weight="semibold">Generated theme</Text>
            <Text tone="muted">Primitives compose against the active Tailwind token surface.</Text>
          </Stack>
          <Sparkles className="size-5 text-brand" />
        </Card.Header>
        <Card.Content>
          <Stack gap="$3">
            <Input label="Theme prompt" defaultValue="bento saas dashboard compact" />
            <Stack direction="row" gap="$3">
              <Button>
                <Button.Icon><Sparkles className="size-4" /></Button.Icon>
                <Button.Text>Generate</Button.Text>
              </Button>
              <Button tone="neutral" variant="outline">
                <Button.Text>Export tokens</Button.Text>
              </Button>
            </Stack>
          </Stack>
        </Card.Content>
      </Card>
    </Stack>
  )
};

export const ButtonVariants: Story = {
  render: () => (
    <Stack direction="row" gap="$3" wrap>
      <Button><Button.Text>Solid</Button.Text></Button>
      <Button variant="soft"><Button.Text>Soft</Button.Text></Button>
      <Button variant="outline"><Button.Text>Outline</Button.Text></Button>
      <Button variant="glass"><Button.Text>Glass</Button.Text></Button>
      <Button tone="danger" variant="soft"><Button.Text>Danger</Button.Text></Button>
    </Stack>
  )
};
