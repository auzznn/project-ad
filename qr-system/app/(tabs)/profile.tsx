import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { studentApi } from "@/api/studentApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);

  const backgroundColor = useThemeColor("background");
  const cardColor = useThemeColor("card");
  const textColor = useThemeColor("text");
  const primaryColor = useThemeColor("primary");
  const borderColor = useThemeColor("border");

  // Fetch children data if user is a parent
  useEffect(() => {
    if (user?.role === "parent" && user?.user_id) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    if (!user?.user_id) return;

    try {
      const childrenData = await studentApi.getChildren(user.user_id);
      setChildren(childrenData);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirmation'), [
      { text: t('cancel'), style: "cancel" },
      {
        text: t('logout'),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(onboarding)");
        },
      },
    ]);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      admin: t('administrator'),
      teacher: t('teacher'),
      parent: t('parent'),
      student: t('student'),
    };
    return roleNames[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centered]}>
        <Text style={[styles.loadingText, { color: textColor }]}>
          {t('noUserDataAvailable')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <View style={styles.profileHeader}>
          <View
            style={[styles.avatarContainer, { backgroundColor: cardColor }]}
          >
            <Ionicons name="person" size={50} color={primaryColor} />
          </View>
          <Text style={styles.profileName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: cardColor }]}>
            <Text style={[styles.roleText, { color: primaryColor }]}>
              {getRoleDisplayName(user?.role || "user")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Account Information */}
        <View
          style={[styles.section, { backgroundColor: cardColor, borderColor }]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('accountInformation')}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={textColor} />
            <Text style={[styles.infoLabel, { color: textColor }]}>
              {t('fullName')}
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-outline" size={20} color={textColor} />
            <Text style={[styles.infoLabel, { color: textColor }]}>Role</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {getRoleDisplayName(user?.role || "user")}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View
          style={[styles.section, { backgroundColor: cardColor, borderColor }]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('actions')}
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() =>
              router.push("/language")
            }
          >
            <Ionicons name="settings-outline" size={20} color={textColor} />
            <Text style={[styles.actionText, { color: textColor }]}>
              {t('changeLanguage')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => Alert.alert(t('helpAndSupport'), t('helpComingSoon'))}
          >
            <Ionicons name="help-circle-outline" size={20} color={textColor} />
            <Text style={[styles.actionText, { color: textColor }]}>
              {t('helpAndSupport')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton, { borderColor }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={[styles.actionText, styles.logoutText]}>{t('logout')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    textAlign: "right",
  },
  childCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  childClass: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#ef4444",
  },
});
