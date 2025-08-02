import { Wifi, Usb, Bluetooth, Network, HardDrive, ShieldCheck, Fingerprint, RadioTower } from "lucide-react"

const vectors = [
    { name: "Network (SMB/FTP)", icon: <Network className="h-5 w-5 text-foreground" />, status: "Monitored", color: "text-green-400" },
    { name: "SSH Connections", icon: <Fingerprint className="h-5 w-5 text-foreground" />, status: "Monitored", color: "text-green-400" },
    { name: "Service Discovery (Zeroconf)", icon: <RadioTower className="h-5 w-5 text-foreground" />, status: "Monitored", color: "text-green-400" },
    { name: "Wireless USB", icon: <Usb className="h-5 w-5 text-foreground" />, status: "Secure", color: "text-green-400" },
    { name: "Bluetooth", icon: <Bluetooth className="h-5 w-5 text-foreground" />, status: "Secure", color: "text-green-400" },
    { name: "System Drivers", icon: <HardDrive className="h-5 w-5 text-foreground" />, status: "Up-to-date", color: "text-green-400" },
    { name: "Nearby Devices", icon: <Wifi className="h-5 w-5 text-foreground" />, status: "No threats", color: "text-green-400" },
    { name: "PnP Events", icon: <ShieldCheck className="h-5 w-5 text-foreground" />, status: "Monitored", color: "text-green-400" },
]

export function SystemVectors() {
    return (
        <div className="space-y-4">
            {vectors.map((vector, index) => (
                <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {vector.icon}
                        <span className="font-medium text-sm">{vector.name}</span>
                    </div>
                    <div className={`text-sm font-semibold ${vector.color}`}>{vector.status}</div>
                </div>
            ))}
        </div>
    )
}
