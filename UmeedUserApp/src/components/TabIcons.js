import React from 'react';
import {
  Bell,
  Book,
  Calendar,
  Camera,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardList,
  FileText,
  HandHeart,
  HeartHandshake,
  House,
  Info,
  List,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkle,
  UsersRound,
  X,
} from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const ICON_SIZE = 24;
const STROKE_WIDTH = 2;

const S = StyleSheet.create({
  box: { width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center' },
});

export const HomeIcon = ({ color }) => <House color={color} size={ICON_SIZE} strokeWidth={STROKE_WIDTH} />;
export const IssuesIcon = ({ color }) => (
  <ClipboardList color={color} size={ICON_SIZE} strokeWidth={STROKE_WIDTH} />
);
export const WelfareIcon = ({ color }) => <HandHeart color={color} size={ICON_SIZE} strokeWidth={STROKE_WIDTH} />;
export const CommunityIcon = ({ color }) => (
  <UsersRound color={color} size={ICON_SIZE} strokeWidth={STROKE_WIDTH} />
);

const ICONS = {
  report: ClipboardList,
  welfare: HandHeart,
  donate: HeartHandshake,
  community: UsersRound,
  blood: HandHeart,
  bell: Bell,
  back: ChevronLeft,
  close: X,
  check: Check,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  search: Search,
  camera: Camera,
  location: MapPin,
  calendar: Calendar,
  chart: ChartNoAxesCombined,
  info: Info,
  help: CircleHelp,
  phone: Phone,
  mail: Mail,
  feedback: MessageCircle,
  event: Calendar,
  volunteer: UsersRound,
  book: Book,
  shield: Shield,
  doc: FileText,
  receipt: Receipt,
  impact: Sparkle,
  list: List,
  settings: Settings,
  logout: LogOut,
  about: Info,
};

export const AppIcon = ({ name, color = colors.ink, size = ICON_SIZE, ...rest }) => {
  const Icon = ICONS[name] || Circle;
  return <Icon {...rest} color={color} size={size} strokeWidth={STROKE_WIDTH} />;
};

export const TabIcon = ({ name, color, size = ICON_SIZE, accessibilityLabel }) => {
  const Icon = ICONS[name] || Circle;
  return (
    <View style={S.box}>
      <Icon color={color} size={size} strokeWidth={STROKE_WIDTH} accessibilityLabel={accessibilityLabel} />
    </View>
  );
};
