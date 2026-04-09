import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AccessLevel } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface UserManagementModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  currentUsername: string;
}

export function UserManagementModal({
  open,
  onClose,
  currentUsername,
}: UserManagementModalProps) {
  const { createUser, deleteUser, listUsers } = useAuth();
  const [users, setUsers] = useState<
    Array<{ username: string; accessLevel: AccessLevel }>
  >([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccessLevel, setNewAccessLevel] =
    useState<AccessLevel>("view-only");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refreshUsers = () => setUsers(listUsers());

  useEffect(() => {
    if (open) {
      setUsers(listUsers());
      setCreateError(null);
      setCreateSuccess(null);
      setNewUsername("");
      setNewPassword("");
      setNewAccessLevel("view-only");
    }
  }, [open, listUsers]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError("Username and password are required.");
      return;
    }
    setCreateError(null);
    setCreateSuccess(null);
    setIsCreating(true);
    const err = createUser(newUsername.trim(), newPassword, newAccessLevel);
    setIsCreating(false);
    if (err) {
      setCreateError(err);
    } else {
      setCreateSuccess(`User "${newUsername.trim()}" created.`);
      setNewUsername("");
      setNewPassword("");
      setNewAccessLevel("view-only");
      refreshUsers();
    }
  };

  const handleDelete = (username: string) => {
    deleteUser(username);
    refreshUsers();
  };

  const accessLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      admin: "bg-primary/10 text-primary border-primary/20",
      "full-edit": "bg-accent/10 text-accent border-accent/20",
      "view-only": "bg-muted text-muted-foreground border-border",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level] ?? colors["view-only"]}`}
      >
        {level}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="user-mgmt-desc"
        data-ocid="user-mgmt-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-display font-semibold">
            Manage Users
          </DialogTitle>
        </DialogHeader>
        <p id="user-mgmt-desc" className="sr-only">
          Create and delete user accounts for the dashboard.
        </p>

        {/* Existing users list */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Current Users
          </h3>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No users found.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {users.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center justify-between px-3 py-2 bg-card hover:bg-muted/30 transition-colors"
                  data-ocid={`user-row-${u.username}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {u.username}
                    </span>
                    {accessLevelBadge(u.accessLevel)}
                  </div>
                  {u.username !== currentUsername && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(u.username)}
                      aria-label={`Delete user ${u.username}`}
                      data-ocid={`delete-user-${u.username}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create user form */}
        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Create New User
          </h3>
          <form onSubmit={handleCreate} className="space-y-3" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="new-username" className="text-xs">
                  Username
                </Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-8 text-xs"
                  disabled={isCreating}
                  data-ocid="new-user-username"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-8 text-xs"
                  disabled={isCreating}
                  data-ocid="new-user-password"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-access" className="text-xs">
                Access Level
              </Label>
              <Select
                value={newAccessLevel}
                onValueChange={(v) => setNewAccessLevel(v as AccessLevel)}
                disabled={isCreating}
              >
                <SelectTrigger
                  className="h-8 text-xs"
                  id="new-access"
                  data-ocid="new-user-access-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view-only" className="text-xs">
                    View Only — read-only access
                  </SelectItem>
                  <SelectItem value="full-edit" className="text-xs">
                    Full Edit — create, edit &amp; delete
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createError && (
              <p className="text-xs text-destructive" role="alert">
                {createError}
              </p>
            )}
            {createSuccess && (
              <p className="text-xs text-accent" aria-live="polite">
                {createSuccess}
              </p>
            )}

            <Button
              type="submit"
              size="sm"
              className="w-full h-8 text-xs"
              disabled={isCreating}
              data-ocid="create-user-submit"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Create User
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
