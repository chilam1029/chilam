import { HStack, Link, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget } from 'expo-widgets';

type MochiWidgetProps = { intake: number; target: number };
const MochiWidgetView = (props: MochiWidgetProps) => {
  'widget';
  const percent = Math.round(props.intake / Math.max(props.target,1) * 100);
  return <VStack spacing={12} modifiers={[padding({all:16})]}>
    <Text modifiers={[font({size:18,weight:'bold'}),foregroundStyle('#262521')]}>Mochi · {percent}%</Text>
    <Text modifiers={[font({size:13}),foregroundStyle('#6B665C')]}>{props.intake} / {props.target} mL</Text>
    <HStack spacing={12}>
      <Link label="+150" destination="mochi://log?ml=150" />
      <Link label="+250" destination="mochi://log?ml=250" />
      <Link label="+500" destination="mochi://log?ml=500" />
    </HStack>
  </VStack>;
};
export default createWidget('MochiQuickLog',MochiWidgetView);
