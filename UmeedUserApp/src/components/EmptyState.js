import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../theme';
import Button from './Button';
import { ClipboardList } from 'lucide-react-native';

export default function EmptyState({ icon = <ClipboardList size={34} color={colors.gray} strokeWidth={2} />, title = 'Nothing here yet', message, actionLabel, onAction, style }) {
  const iconElement = React.isValidElement(icon) ? icon : <ClipboardList size={34} color={colors.gray} strokeWidth={2} />;
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>{iconElement}</View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && !!onAction && (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="outline" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  iconWrap: { marginBottom: spacing.sm },
  title: { fontSize: fontSizes.base, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  message: { fontSize: fontSizes.body, color: colors.gray, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  action: { width: '100%', marginTop: spacing.sm },
});
