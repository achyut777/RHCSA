# RHCSA Complete Notes

---

## Chapter 1 — Vim & SSH

### Bash Shell
- **Bash** = Bourne Again Shell
- `~` (tilde) = home directory
- `root` = administrator

### Command Syntax
```
command [option/argument] [target/path]
```

**Help:**
1. `command --help` — shows all available options
2. `man command` — displays the manual page

---

### Basic Linux Commands

| Command | Description |
|---|---|
| `ls` | List contents of working directory |
| `ls -l` | Long list format |
| `ls -a` | List including hidden files |
| `ls -t` | List by time (latest first) |
| `touch [filename]` | Create blank file |
| `mkdir [dirname]` | Create blank directory |
| `mkdir -p dir1/dir2/dir3` | Create full path |
| `rm [filename]` | Remove file |
| `rmdir [dirname]` | Remove empty directory |
| `rm -rf [file/dir]` | Force remove file or directory |
| `cat` | Read file content on terminal |
| `head [file]` | Read first 10 lines |
| `head -n 5 [file]` | Read first 5 lines |
| `tail [file]` | Read last 10 lines |
| `more` | Gradually read whole file |
| `echo` | Insert text string into file or terminal |

---

### SSH (Secure Shell)

Used to take remote connection to any system.

**Syntax:**
```bash
ssh [username]@[hostname/ip]
```

#### Case 1: Remote Connection Without Password

```bash
ssh-keygen                                          # Generate keys
ssh-copy-id remoteuser@remotehostname/ip            # Copy key to remote
ssh remoteuser@remotehostname                       # Connect
```

#### Case 2: Passphrase Key Generation

```bash
ssh-keygen                     # Enter passphrase when prompted
ssh-copy-id user@host          # Copy key to remote
ssh user@host                  # Will ask passphrase each time
```

#### Case 3: SSH Agent (Skip Passphrase Every Time)

```bash
eval $(ssh-agent)              # Start ssh-agent process
ssh-add .ssh/privatekeyname    # Add key credentials to agent
ssh user@host                  # Connect without passphrase prompt
```

#### Non-Default (Non-Interactive) Key

```bash
ssh-keygen -f .ssh/mykey                      # Step 1: Generate custom-named key
ssh-copy-id -i .ssh/mykey.pub user@hostname   # Step 2: Copy to remote (-i ignores default key name)
```

---

## Chapter 2 — Manage Files from Command Line

### Creating

```bash
mkdir dir1                  # Create directory
mkdir -p dir1/dir2/dir3     # Create full path
touch filename              # Create/update file
```

### Copying

```bash
cp source_file dest_file    # Copy file
cp -r source_dir dest_dir   # Copy directory (must use -r for folders)
```

### Moving / Renaming

```bash
mv file1 /tmp/              # Move file
mv oldname.txt newname.txt  # Rename file
```

### Deleting

```bash
rm file1                    # Delete file
rm -r dir1                  # Delete directory
rm -rf dir1                 # Force delete (no confirmation — dangerous)
rmdir dir1                  # Remove empty directory only (safest)
```

---

### Links

| Feature | Soft Link (Symbolic) | Hard Link |
|---|---|---|
| Command | `ln -s hello.txt softlink.txt` | `ln hello.txt hardlink.txt` |
| Concept | Shortcut pointing to a path | Mirror pointing to the same inode |
| Inode | Different inode number | Same inode number |
| If Original Deleted | Link breaks (flashing red) | Data remains safe |
| Cross Partition? | Yes | No |
| Link Directory? | Yes | No |
| Verify | `ls -l` (shows `->`) | `ls -i` (check inode matches) |

---

### Shell Expansions

#### A. Wildcards (Globbing)

| Pattern | Meaning | Example |
|---|---|---|
| `*` | Matches everything | `rm *.txt` |
| `?` | Matches one character | `ls file?.txt` |
| `[abc]` | Matches one char from list | `ls file[123].txt` |

#### B. Brace Expansion `{}`

```bash
touch file{1..20}.txt          # Creates 20 files
mkdir /{var,etc}/newfolder     # Creates folder in two paths
```

#### C. Variable & Command Expansion

```bash
echo $USER        # Prints current user
echo $(date)      # Runs date and prints output
```

#### D. Quoting / Escaping

| Method | Behavior |
|---|---|
| `\` (backslash) | Escapes the next character |
| `""` (double quotes) | Weak quote — allows `$` and backticks |
| `''` (single quotes) | Strong quote — everything is literal |

---

### Searching & Processing Content

#### grep

```bash
grep -i "term" file     # Ignore case
grep -v "term" file     # Invert match (lines NOT containing term)
grep -r "term" dir/     # Recursive search in folder
grep -w "term" file     # Whole word match only
grep "^root" /etc/passwd    # Lines starting with root
grep "bash$" /etc/passwd    # Lines ending with bash
```

#### Viewing & Sorting

```bash
head -n 5 file          # First 5 lines
tail -n 5 file          # Last 5 lines
tail -f file            # Follow file (real-time log monitoring)
sort file               # Sort alphabetically
sort -n file            # Sort numerically
sort -u file            # Remove duplicates
```

---

## Chapter 3 — Users and Groups

### Types of Users

| Type | Description | UID Range |
|---|---|---|
| Superuser (root) | Full system control | 0 |
| Regular/Local User | Normal login users | 1000–60000 |
| System User | Used by services/daemons | 1–999 |

---

### /etc/passwd File

Structure: `username:x:UID:GID:comment:home_dir:shell`

Example: `root:x:0:0:/root:/bin/bash`

---

### Creating & Managing Users

```bash
useradd username           # Create user
passwd username            # Assign password
useradd --help             # View all options
id username                # Check user details (UID, GID, groups)
```

---

### usermod — Modify an Existing User

```bash
usermod -l newname oldname                  # Change login name
usermod -g groupname username              # Change primary group
usermod -aG groupname username             # Add secondary group (-a = append)
usermod -aG group1,group2 username         # Add multiple secondary groups
usermod -d /new/home username              # Change home dir (no file move)
usermod -d /new/home -m username           # Change home dir + move files
usermod -s /bin/bash username              # Change login shell
usermod -L username                        # Lock account
usermod -U username                        # Unlock account
usermod -u 3005 username                   # Change UID
usermod -g 5000 username                   # Change GID
usermod -e YYYY-MM-DD username             # Set account expiry date
usermod -f days username                   # Set password expiry days
usermod -c "Full Name" username            # Change comment/full name
```

---

### Groups

```bash
# Group info stored in /etc/group

groupmod -n newgroup oldgroup   # Change group name
groupmod -g newGID groupname    # Change group GID
```

---

### SUDO

- Allows regular user to execute commands as root.
- Configured in `/etc/sudoers`

```bash
# Give sudo to a user:
username   ALL=(ALL)   ALL

# Give sudo to a group:
%groupname   ALL=(ALL)   ALL

# Bypass password:
username   ALL=(ALL)   NOPASSWD:ALL
```

---

### Switching Users (su)

```bash
su username       # Switch user (no environment load)
su - username     # Switch user with full environment
su - root         # Switch to root using root password
su -              # Switch to root
sudo -i           # Switch to root using current user's password
```

---

### /etc/shadow — Password Storage

Fields: `encrypted_password : last_change : min_age : max_age : warn_days : inactive_days : expiry_date`

---

### chage — Password Policy

```bash
chage username          # Manage password policy (interactive)
chage -l username       # View current policy settings
```

**Field Reference:**

| Flag | Meaning |
|---|---|
| `-d` | Last password change |
| `-m` | Min password age (0 = change anytime) |
| `-M` | Max password age |
| `-W` | Warn days before expiry |
| `-I` | Inactive days after expiry |
| `-E` | Account expiry date (YYYY-MM-DD) |

**Calculate expiry date 240 days from now:**
```bash
date -d "240 days"
```

Global policy: `/etc/login.defs`

---

## Chapter 4 — Access Control (DAC)

### Permission Types
- **Read (r)** = 4
- **Write (w)** = 2
- **Execute (x)** = 1

### View Permissions
```bash
ls -l filename
```
Format: `-rwx rwx rwx` (user | group | others)

---

### chmod — Change Permissions

#### Symbolic Method

Syntax: `chmod who+/-/=which filename`

- **who**: `u` (user), `g` (group), `o` (others), `a` (all)
- **what**: `+` add, `-` remove, `=` assign
- **which**: `r`, `w`, `x`

```bash
chmod u+x file      # Add execute for user
chmod go-w file     # Remove write from group and others
chmod a+r file      # Add read for all
```

#### Octal Method

```bash
chmod 777 file      # Full permissions to all
chmod 755 file      # rwxr-xr-x
chmod 644 file      # rw-r--r--
```

---

### Ownership

```bash
chown username filename              # Change user ownership
chown username:groupname filename    # Change user and group ownership
chgrp groupname filename             # Change group ownership only
```

---

### Special Permissions

| Permission | Name | Symbol | Octal | Purpose |
|---|---|---|---|---|
| SUID | Set User ID | `u+s` | 4xxx | Runs file as owner |
| SGID | Set Group ID | `g+s` | 2xxx | Runs file as group owner |
| Sticky Bit | Sticky | `o+t` | 1xxx | Users cannot delete others' files |

```bash
chmod u+s filename        # Add SUID
chmod u-s filename        # Remove SUID
chmod 4744 filename       # SUID with octal

chmod g+s filename        # Add SGID
chmod g-s filename        # Remove SGID
chmod 2744 filename       # SGID with octal

chmod o+t filename        # Add sticky bit
chmod o-t filename        # Remove sticky bit
chmod 1744 filename       # Sticky bit with octal
```

---

### umask — Default Permissions

```
umask = max permission - default permission
```

- Default max file permission: **666**
- Default max directory permission: **777**

```bash
umask               # Check current umask
umask 027           # Set umask temporarily
```

**Persistent changes:**
- Per user: `~/.bashrc` — add `umask 027` at the bottom
- Global: `/etc/profile` — add `umask 027` at the bottom
- User-level takes priority over global

---

## Chapter 6 — Processes & Monitoring

### Types of Processes

1. **Foreground** — attached to terminal, direct I/O
2. **Background** — detached, runs behind using `&`

```bash
firefox &           # Output: [1] 12345 ([job_id] PID)
```

---

### Job Control

```bash
command &           # Start in background
jobs                # List jobs in this shell
fg %1               # Bring job 1 to foreground
bg %1               # Resume stopped job 1 in background
Ctrl-Z              # Suspend current foreground process
disown %1           # Remove job from shell (won't receive SIGHUP)
```

---

### Process Listing (ps)

```bash
ps                          # Processes in current terminal
ps -l                       # Long format (UID, STAT, PRI, PPID)
ps aux                      # All processes for all users
ps -o pid,ppid,uid,cmd      # Custom columns
pgrep firefox               # Find PID by name
pidof sshd                  # Get PID of program
pstree                      # Process tree view
top                         # Real-time process viewer
htop                        # Interactive process viewer
```

---

### Process States (STAT column)

| State | Meaning |
|---|---|
| R | Running or Runnable |
| S | Sleeping (idle) |
| D | Uninterruptible Sleep (I/O wait) |
| T | Stopped or Traced |
| Z | Zombie (exited, not reaped) |

---

### Signals & Kill

```bash
kill <PID>              # SIGTERM (polite terminate)
kill -9 <PID>           # SIGKILL (force kill)
kill -SIGSTOP <PID>     # Stop/suspend process
kill -SIGCONT <PID>     # Continue stopped process
kill -l                 # List all signals

pkill processname       # Send SIGTERM by name
pkill -9 processname    # Force kill by name
killall processname     # Kill all with exact name
```

**Common Signals:**

| Signal | Number | Meaning |
|---|---|---|
| SIGTERM | 15 | Graceful terminate (default) |
| SIGKILL | 9 | Force kill (cannot be caught) |
| SIGSTOP | — | Suspend process |
| SIGCONT | — | Resume suspended process |
| SIGHUP | 1 | Reload config (daemons) |
| SIGINT | 2 | Keyboard interrupt (Ctrl-C) |

---

### Load Monitoring

```bash
uptime              # Current time, uptime, load averages (1, 5, 15 min)
lscpu               # CPU info (look for CPU(s): field)
top                 # Real-time (press s to change interval)
```

**Interpreting load average:**
```
load_average / CPU_count > 1  →  system overloaded
```

**Top shortcuts:**
- `s` — change response time
- `Shift+B` — toggle bold running commands
- `k` — kill a process
- `Shift+F` — customize layout
- `Shift+T` — sort by CPU (descending)
- `Shift+M` — sort by memory (descending)

---

### Process Priority (nice / renice)

- Nice range: **-20** (highest priority) to **19** (lowest priority)
- Default nice: **0** (running with `nice` alone defaults to 10)
- Only root can set negative nice values

```bash
nice -n 10 command              # Start with lower priority (+10)
renice -n -5 -p 12345           # Change priority of running process
ps -l                           # View nice values of running processes
```

---

### Tuned (System Performance Profiles)

```bash
tuned-adm active                              # Check current active profile
tuned-adm recommend                           # Get recommended profile
tuned-adm profile virtual-guest               # Set a profile
tuned-adm profile throughput-performance      # Set throughput profile
systemctl status tuned.service                # Check if tuned is installed/running
```

Config: `/etc/tuned/tuned-main.conf`  
Profiles: `/usr/lib/tuned/`

---

## Chapter 7 — Scheduling Tasks

### at Command (One-Time Tasks)

```bash
at 07:40                    # Schedule task at 7:40 AM
at now + 5 minutes          # Schedule 5 minutes from now
at tomorrow                 # Schedule for tomorrow
at 14:00 Jan 1              # Specific date/time
atq                         # List pending at jobs
atrm 1                      # Remove job with ID 1
```

---

### crontab (Recurring Tasks)

```bash
crontab -e                      # Edit/create cron jobs
crontab -l                      # List current cron jobs
crontab -r                      # Remove ALL jobs (caution!)
sudo crontab -u student -e      # Edit another user's crontab (as root)
```

**Crontab Syntax:**
```
M   H   DM   Month   DW   COMMAND
*   *    *     *      *   echo "hello"
```

| Field | Range | Meaning |
|---|---|---|
| M | 0–59 | Minute |
| H | 0–23 | Hour |
| DM | 1–31 | Day of Month |
| Month | 1–12 | Month |
| DW | 0–7 | Day of Week (0 or 7 = Sunday) |

**Example:**
```bash
* * * * * echo "this is my first crontab task" >> cron.txt
```
Runs every minute.

---

### System Crontab (`/etc/crontab`)

Requires an extra **USER** field:
```
M   H   DM   Month   DW   USER   COMMAND
*   *    *     *      *   student   echo "hello" >> hello.txt
```

---

### Access Control

- `/etc/cron.allow` — only listed users can use crontab
- `/etc/cron.deny` — all users allowed except those listed

---

### Anacron (`/etc/anacrontab`)

- Backup for crontab on non-24/7 systems
- Runs missed jobs after system boots
- Place scripts in:
  - `/etc/cron.daily/`
  - `/etc/cron.weekly/`
  - `/etc/cron.monthly/`
- **Time accuracy not guaranteed, but execution is guaranteed**

---

### Tip: `sudo !!`

Re-runs the last command with sudo (History Expansion):
```bash
sudo !!    # Prepends sudo to the last command run
```

---

## Chapter 8 — Software Packages

### Package Managers

| Tool | Full Name |
|---|---|
| rpm | Red Hat Package Manager |
| yum | Yellowdog Updater Modified |
| dnf | Dandified YUM (v9, latest) |

**Repositories:**
- **BaseOS** — essential system packages
- **AppStream** — additional and 3rd-party packages

---

### Common Commands

```bash
yum install httpd               # Install package
yum install @"group name"       # Install group
yum remove httpd                # Remove package
yum info httpd                  # Package info
yum group info "group"          # Group info
yum list httpd                  # List versions
yum search all "keyword"        # Search by keyword
yum provides "name"             # Find package by provided file
yum history                     # Show package history
yum update                      # Update all packages (safe)
yum upgrade                     # Update + remove obsolete packages
httpd -v                        # Verify installation
```

**yum update vs yum upgrade:**

| Command | Handles Obsolete? | Safe for Production? |
|---|---|---|
| `yum update` | No (keeps old) | Yes |
| `yum upgrade` | Yes (removes old) | Use with caution |

---

### Adding a Repository

**CLI method:**
```bash
dnf config-manager --add-repo="repo_url"
```

**Manual method:**
Create a `.repo` file in `/etc/yum.repos.d/` and configure it.

---

## Chapter 9 — Basic Storage Management

### Key Commands

```bash
lsblk               # Check storage devices and partitions
lsblk -fp           # Show filesystem info
lsblk -fs           # Show filesystem type
df -h               # Show actual used/available storage
```

**Filesystem types:** `xfs`, `ext2`, `ext3`, `ext4`

---

### Partition Schemes

| Scheme | Type | Max Partitions | Max Size | Boot |
|---|---|---|---|---|
| MBR | Old/DOS | 15 (4 primary + 11 extended) | 2 TB | BIOS/UEFI |
| GPT | New | 128 | 8 ZB (8 billion TB) | UEFI |

---

### Creating Partitions with fdisk

```bash
fdisk /dev/sdb      # Open disk for partitioning
```

**Inside fdisk:**
```
n   → new partition
p   → primary
Enter   → default first sector (always press Enter)
+2G     → size of partition
p   → print partition table
w   → write and exit
```

```bash
partprobe           # Inform kernel of new partition
```

---

### Format Partition

```bash
mkfs.xfs /dev/sdb1       # Format as XFS
mkfs.ext4 /dev/sdb1      # Format as EXT4
mkfs -t xfs /dev/sdb1    # Alternative syntax
```

---

### Mount

```bash
mkdir /mnt/data1                    # Create mount point
mount /dev/sdb1 /mnt/data1          # Temporary mount
umount /mnt/data1                   # Unmount
lsof /mnt/data1                     # Check if mount point is busy
fuser -m /mnt/data1                 # Check processes using mount
```

---

### Permanent Mount (`/etc/fstab`)

```bash
vim /etc/fstab
```

Add entry:
```
/dev/sdb1   /mnt/data1   ext4   defaults   0 0
```

| Field | Meaning |
|---|---|
| `/dev/sdb1` | Device path |
| `/mnt/data1` | Mount point |
| `ext4` | Filesystem |
| `defaults` | Standard mount options |
| `0` (first) | Dump disabled |
| `0` (second) | fsck order (0 = skip check) |

```bash
systemctl daemon-reload     # Reload systemd
mount -a                    # Validate fstab (no output = OK)
```

---

### Swap Partition

> Memory Code: **CFPA** — Create → Format → Persistent → Activate

```bash
# Step 1: Create partition (fdisk)
fdisk /dev/sdX
# Inside fdisk: n → p → Enter → +1G → t → 82 (MBR) or 8200 (GPT) → w

# Step 2: Format as swap
mkswap /dev/sdXN

# Step 3: Add to fstab
vim /etc/fstab
# Add: /dev/sdXN   swap   swap   defaults   0 0

# Step 4: Enable
swapon -a
swapon --show       # Verify
```

**Swap Priority** (higher number = used first):
```
/dev/sdXN   swap   swap   pri=10   0 0
```

---

### Deleting a Partition

```bash
fdisk /dev/sdb    # d (delete) → p (print) → w (save)
partprobe
```

Remove fstab entry first, then unmount, then delete partition.

---

## Chapter 10 — LVM (Logical Volume Manager)

### Components (Hierarchy)

```
Physical Disk/Partition
       ↓
Physical Volume (PV)  ← first imaginary layer
       ↓
Volume Group (VG)     ← collection of PVs
       ↓
Logical Volume (LV)   ← used like a partition
```

---

### Part A: Creating LVM

```bash
# Step 1: Create LVM-type partition
fdisk /dev/sdb
# n → p → Enter → +1G → t → 8e (MBR LVM type) → w
partprobe

# Step 2: Create Physical Volume
pvcreate /dev/sdb1
pvdisplay               # View PVs

# Step 3: Create Volume Group
vgcreate myvg /dev/sdb1
vgcreate myvg /dev/sdb1 /dev/sdc1   # Multiple PVs
vgcreate -s 16M myvg /dev/sdb1      # Custom PE size (default 4MB)
vgdisplay               # View VGs

# Step 4: Create Logical Volume
lvcreate -n mylv -L 5G myvg           # By size
lvcreate -n mylv -l 255 myvg          # By PE count

# Step 5: Apply Filesystem
mkfs.xfs /dev/myvg/mylv
mkfs.ext4 /dev/myvg/mylv

# Step 6: Create Mount Point
mkdir /mnt/data

# Step 7: Permanent Mount
vim /etc/fstab
# Add: /dev/myvg/mylv   /mnt/data   xfs   defaults   0 0

mount -a                # Validate
systemctl daemon-reload
```

---

### Part B: Extending LVM

```bash
lvextend -L +1G /dev/myvg/mylv            # Extend by 1G
lvextend -l +255 /dev/myvg/mylv           # Extend by PE count
lvextend -L +1G -r /dev/myvg/mylv         # Extend LV + filesystem (-r)

# Extend filesystem separately:
xfs_growfs /dev/myvg/mylv     # XFS
resize2fs /dev/myvg/mylv      # EXT family

# If VG has no free space, extend VG first:
pvcreate /dev/sdc1
vgextend myvg /dev/sdc1
lvextend -L +5G -r /dev/myvg/mylv
```

---

### Part C: Reducing LVM

> **XFS CANNOT be reduced. Only EXT family can be reduced.**

```bash
umount /mnt/data
fsck /dev/myvg/mylv
resize2fs /dev/myvg/mylv 3G
lvreduce -L 3G /dev/myvg/mylv
mount -a
```

---

### Part D: Deleting LVM

```bash
umount /mnt/data                    # Step 1: Unmount
vim /etc/fstab                      # Step 2: Remove entry
lvremove /dev/myvg/mylv             # Step 3: Remove LV
vgremove myvg                       # Step 4: Remove VG
pvremove /dev/sdb1                  # Step 5: Remove PV
```

---

## Chapter 11 — Boot Process & Services

### systemd & Services

- **Service** = program = process
- **systemd** = first process (PID 1) that starts at boot
- Services ending in `d` = daemon (background system service)
- Managed with `systemctl`

```bash
yum install httpd                       # Install service
systemctl status httpd                  # Check status
systemctl start httpd                   # Start (temporary)
systemctl stop httpd                    # Stop
systemctl enable httpd                  # Enable at boot (permanent)
systemctl disable httpd                 # Disable at boot
systemctl enable httpd --now            # Enable + start immediately
systemctl restart httpd                 # Stop and start again
systemctl reload httpd                  # Reload config without stopping
systemctl reload-or-restart httpd       # Let system decide
systemctl mask httpd                    # Prevent any start (permanent block)
systemctl unmask httpd                  # Unmask
```

Config file for httpd: `vim /etc/httpd/conf/httpd.conf`
- Document root: `/var/www/html`
- Change port: `Listen 8080`

---

### Boot Targets

```bash
systemctl get-default                           # Check current default target
systemctl isolate multi-user.target             # Switch temporarily (runtime)
systemctl set-default multi-user.target         # Set permanently (reboot needed)
systemctl list-dependencies <service/target>    # View dependencies
```

| Target | Mode |
|---|---|
| `graphical.target` | GUI mode |
| `multi-user.target` | CLI mode |

---

### Linux Boot Process

1. **BIOS/UEFI** — hardware check, loads bootloader
2. **GRUB2** — shows OS menu, loads Kernel + initramfs
3. **Kernel** — detects hardware, starts systemd (PID 1)
4. **initramfs** — temporary root filesystem, loads drivers
5. **systemd** — reads default target, starts services
6. **Login Screen** — CLI or GUI

---

### Root Password Reset (RHCSA Exam Critical)

```
Step 1:  Reboot
Step 2:  Press Up/Down arrow to stop GRUB countdown
Step 3:  Press 'e' to edit boot entry
Step 4:  Find the line starting with "linux", press End
Step 5:  Add 'rd.break' at end of line (RHEL 8/9)
Step 6:  Press Ctrl+X to boot into emergency mode
Step 7:  mount -o remount,rw /sysroot
Step 8:  chroot /sysroot
Step 9:  passwd
Step 10: touch /.autorelabel    ← CRITICAL! Without this, system won't boot
Step 11: exit
         exit
```
System reboots and applies SELinux relabeling.

---

## Chapter 11b — Logs & Time

### Log Architecture

1. **systemd-journald** — catches logs first (kernel, boot, services); temporary (non-persistent)
2. **rsyslog** — reads from journal, sorts by type/priority, writes to `/var/log` (persistent)

### Important Log Files

| File | Contents |
|---|---|
| `/var/log/messages` | General system messages (catch-all) |
| `/var/log/secure` | Security & authentication (logins, sudo) |
| `/var/log/maillog` | Mail server events |
| `/var/log/cron` | Scheduled jobs (crontab) |
| `/var/log/boot.log` | Startup messages |

```bash
less /var/log/messages      # Read large log file (scroll up/down)
tail -f /var/log/messages   # Real-time log monitoring
```

---

### Time Zone & NTP (Chrony)

```bash
timedatectl                              # Check timezone and NTP status
tzselect                                 # Find timezone interactively
timedatectl set-timezone America/Jamaica # Set timezone
timedatectl set-ntp false                # Turn off NTP (to set time manually)
```

**Configure Chrony NTP Client:**
```bash
# Step 1: Set timezone
timedatectl set-timezone America/Jamaica

# Step 2: Install chrony
dnf install chrony -y

# Step 3: Edit config
vim /etc/chrony.conf
# Add: server 172.25.254.254 iburst
# Comment out existing server lines

# Step 4: Restart/enable service
systemctl restart chronyd
systemctl enable chronyd

# Step 5: Verify (* next to server = success, ? = failed)
chronyc sources
```

---

## Chapter 12 — SELinux

### What is SELinux?

- **S**ecurity **E**nhanced Linux
- MAC = Mandatory Access Control (vs DAC which is permission-based)
- Built into the kernel (no separate service)
- Works by matching **process tags** with **resource tags** — if they match, access is allowed

---

### SELinux Modes

| Mode | Behavior |
|---|---|
| Enforcing | SELinux is ON, policies applied |
| Permissive | SELinux OFF (no policy), but logs generated |
| Disabled | SELinux OFF, no logs |

```bash
getenforce                         # Check current mode
setenforce 1                       # Set enforcing (temporary)
setenforce 0                       # Set permissive (temporary)
vim /etc/selinux/config            # Permanent mode change
sestatus                           # Full SELinux status
```

---

### Viewing SELinux Labels (Context/Tags)

```bash
ls -Z filename                  # File context
ls -dZ /tmp/                    # Directory context
ps axZ                          # Process context
```

Context format: `user:role:type:level`
The **type** field is what we usually work with.

---

### Changing SELinux Context

**Temporary:**
```bash
chcon -t httpd_sys_content_t demo.html
```

**Permanent (via SELinux Database):**
```bash
semanage fcontext -l | grep root                          # View database
semanage fcontext -a -t httpd_sys_content_t /root/demo.html   # Add record
restorecon -Rv /root/                                      # Apply from database
```

---

### SELinux Port Context

```bash
semanage port -l                        # View all port contexts
semanage port -l | grep http            # Filter for http
semanage port -a -t http_port_t -p tcp 82   # Add port 82 to http context
curl localhost:82                        # Test without browser
```

**Exam scenario:** Change httpd port in config → SELinux blocks it → Add port to SELinux policy → Restart service.

---

### SELinux Logs & Troubleshooting

```bash
journalctl | grep sealert                       # Find SELinux denial logs
# Copy the 'sealert ...' command from output and run it for suggestions
```

---

### SELinux Booleans

```bash
getsebool -a | grep http                          # View http booleans
setsebool httpd_enable_homedirs on                # Set boolean (temporary)
setsebool httpd_enable_homedirs on -P             # Set boolean (permanent)
```

---

## Chapter 15 — Firewall

> All firewall commands start with `firewall-cmd`

```bash
firewall-cmd --get-services                                     # List all services
firewall-cmd --get-default-zone                                 # Check default zone
firewall-cmd --set-default-zone=internal                        # Set default zone
firewall-cmd --add-source=192.2.2.2 --zone=internal            # Allow source IP
firewall-cmd --remove-source=192.2.2.2 --zone=internal         # Remove source IP
```

**Rule:** `--add` to add, `--remove` to remove, `--get` to view.

**Make permanent:**
```bash
firewall-cmd --add-source=192.2.2.2 --zone=internal --permanent
```

Reference: Book page 535

---

## Chapter — Networking

### IP Address Basics

- **IPv4** = 32 bits (4 octets × 8 bits)
- Example: `192.168.1.24`
- Network bits + Host bits

```bash
ip addr         # View IP address (also: ip a or ifconfig)
ip link show    # Show all network adapters
ip route        # Show routing table / gateway
ping hostname   # Test connectivity
ping -c 5 www.google.com    # Ping 5 times only
tracepath access.redhat.com # Trace route (hops)
ss -ta          # Socket statistics (active SSH connections etc.)
hostname        # Check hostname
```

`/etc/hosts` — local DNS cache file

---

### Configuring Network with nmtui

```bash
nmtui    # Network Manager Terminal UI
```

**Steps:**
1. Open `nmtui`
2. Go to "Edit a connection" (avoid editing bridge interfaces)
3. Select `eth0`
4. Change IPv4 Configuration from **Automatic** to **Manual**
5. Fill in IP, subnet, gateway as per question
6. Go to "Set system hostname"
7. Go to "Activate a connection" → deactivate then reactivate to apply

**Verify:**
```bash
ping <gateway>      # Test network config
yum list            # Test repo connectivity
```

---

## Chapter — NFS (Network File Storage)

### Manual Method (Temporary)

```bash
dnf install nfs-utils                                  # Install NFS utilities
showmount --exports server                             # View server exports
mount -t nfs -o rw,sync server:/export /mountpoint    # Mount
umount /path                                           # Unmount
```

### Persistent Method

```bash
vim /etc/fstab
# Add: server:/export   /mountpoint   nfs   rw   0 0
```

---

### Automatic Method (autofs)

```bash
yum install autofs                # Install autofs
```

**Types of autofs:**

1. **Direct** — absolute path mapping
2. **Indirect** — relative path mapping
3. **Wildcard** — dynamic mapping

**Best practice:** Don't edit `/etc/auto.master`; drop a file in `/etc/auto.master.d/`

```bash
systemctl enable autofs --now
```

---

## Chapter 16 — Containers (Podman)

### Concepts

- **Container** = minimal OS + application (no full hypervisor overhead)
- Host OS must be Linux
- **Registry types:** Public (quay.io, docker.io) and Private

**What makes an app run:** Binary + Libraries + Dependencies

**Steps to run a container:**
1. Install container tool (podman)
2. Search image
3. Download image
4. Deploy container

---

### Install & Basic Commands

```bash
yum install container-tools     # Install podman
podman -v                       # Verify installation

podman search httpd             # Search images
podman pull <IMAGE_URL>         # Download image
podman images                   # List downloaded images

podman run -d --name webserver <IMG_URL>        # Create & run container
podman ps                                        # Show running containers
podman ps -a                                    # Show all containers (running + stopped)

podman stop webserver           # Stop container
podman rm webserver             # Remove stopped container
podman rm webserver -f          # Force remove running container
podman rmi <img_url>            # Remove image
```

---

### Working Inside Container

```bash
podman exec -it webserver bash      # Enter container shell
# Inside container: cd /var/www/html/
# Edit using echo (vim not available in minimal OS)
exit                                 # Exit container
```

**Copy file from host to container:**
```bash
podman cp index.html webserver:/var/www/html/
```

---

### Port Forwarding

```bash
# Must be done at container creation time
podman run -d --name webserver -p 8080:80 <IMG_URL>
curl localhost:8080      # Test from host
```

---

### Volume Mount (Data Persistence)

```bash
podman run -d --name webserver \
  -v /backup/:/var/www/html/:Z \
  -p 8080:80 <IMG_URL>
# :Z fixes SELinux context between host and container
```

---

### Build Container Image Locally

```bash
# Create Containerfile with FROM, RUN, CMD instructions
vim Containerfile

podman build -t python-image -f Containerfile    # Build image
podman run -d --name python localhost/python-image:latest   # Run local image
podman push localhost/python-image:latest username/registry  # Push to registry
```

---

### Container as a Service (Auto-start)

#### For Root User

```bash
cd /etc/systemd/system
podman generate systemd --name webserver --files   # Generate service file
systemctl daemon-reload
systemctl enable container-webserver.service --now
```

#### For Rootless (Non-Root) User

```bash
# Must be done as the non-root user with active session (use ssh, check with w)
mkdir -p ~/.config/systemd/user
cd ~/.config/systemd/user
podman generate systemd --name python-platform --files
systemctl --user daemon-reload
systemctl --user enable container-python-platform.service --now
loginctl enable-linger    # CRITICAL: auto-start at boot without login
```

> **Important:** `loginctl enable-linger` must be run — missing this loses 25% of marks.

---

### Rootless Containers Note

- Non-root containers **cannot use ports below 1024** (by default)
- Session must be active as the non-root user when creating/managing containers
- Use `w` command to verify session ownership
- Use `ssh user@host` to ensure a proper session (not `su -`)

---

## tar Command

**Syntax:**
```bash
tar -c[compression]vf [archive_file] [source]
```

| Flag | Meaning |
|---|---|
| `-c` | Create archive |
| `-v` | Verbose output |
| `-f` | File name follows |
| `-j` | bz2 compression |
| `-z` | gz compression |
| `-J` | xz compression |
| `-x` | Extract archive |

```bash
tar -cvjf newfile.tar.bz2 newfile        # Create bz2 archive
tar -cvjf backup.tar.bz2 /usr/local      # Archive /usr/local
man tar                                   # Find compression option for exam
```

---

## find Command

**Syntax:**
```bash
find [search_location] [criteria] [value]
```

```bash
find / -name newfile                # Find by name
find / -user jeel                   # Find all files owned by user jeel
find / -group devops                # Find all files owned by group
find / -perm 750                    # Find files with permission 750
find / -perm 750 -type d            # Find directories with permission 750
find / -perm /g+s                   # Find files with SGID special permission
find / -size +30k -size -45k        # Find files between 30k and 45k

# Find and execute command on results
find / -user jeel -exec cp -pvr {} /root/jeel-files/ \;
# -p = preserve permissions
# -v = verbose
# -r = recursive
# {} = placeholder for found file path
# \; = close exec command
```

---

## Scripting Basics

```bash
vim myscript.sh
```

**Script template:**
```bash
#!/bin/bash
find /usr -perm /g+s -size +30k -size -45k > /root/usr-files
```

```bash
chmod +x myscript.sh    # Give execute permission
sh myscript.sh           # Execute the script
```
