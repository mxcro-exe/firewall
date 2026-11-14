// PatchShield eBPF / XDP Kernel Firewall Program
// Compiles with: clang -O2 -target bpf -c xdp_firewall.c -o xdp_firewall.o
// Loads into Linux Kernel with: ip link set dev eth0 xdp obj xdp_firewall.o sec xdp_patchshield

#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>

#define SEC(NAME) __attribute__((section(NAME), used))

// BPF Map: Blacklisted IPv4 addresses populated by PatchShield Python daemon
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __type(key, __u32);   // IPv4 Address (Network Byte Order)
    __type(value, __u64); // Ban timestamp / Drop counter
    __uint(max_entries, 65536);
} blacklisted_ips SEC(".maps");

SEC("xdp_patchshield")
int filter_ingress_packet(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    // 1. Parse Ethernet Header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) {
        return XDP_PASS;
    }

    if (eth->h_proto != __constant_htons(ETH_P_IP)) {
        return XDP_PASS;
    }

    // 2. Parse IPv4 Header
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end) {
        return XDP_PASS;
    }

    // 3. Lookup Source IP in BPF Kernel Hash Map
    __u32 src_ip = ip->saddr;
    __u64 *drop_stats = bpf_map_lookup_elem(&blacklisted_ips, &src_ip);
    
    if (drop_stats) {
        // MATCH: Drop immediately inside NIC Driver before allocating sk_buff or waking user space
        __sync_fetch_and_add(drop_stats, 1);
        return XDP_DROP;
    }

    // Clean traffic proceeds to TCP/IP network stack
    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
