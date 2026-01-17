import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import employees from '@/routes/employees';
import expenseTypes from '@/routes/expense-types';
import milestoneTemplates from '@/routes/milestone-templates'; // ✅ ADD THIS
import stores from '@/routes/stores';
import tags from '@/routes/tags';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    LayoutGrid,
    Receipt,
    Store,
    Tags as TagsIcon,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import { RnDIcon } from './rndIcon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Employees',
        href: employees.index(),
        icon: Users,
    },
    {
        title: 'Stores',
        href: stores.index(),
        icon: Store,
    },
    {
        title: 'Expense Types',
        href: expenseTypes.index(),
        icon: Receipt,
    },
    {
        title: 'Tags',
        href: tags.index(),
        icon: TagsIcon,
    },
    {
        title: 'Milestone Templates',
        href: milestoneTemplates.index(), // ✅ FIXED: Use wayfinder route
        icon: Calendar, // ✅ FIXED: Add Calendar icon
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Support',
        href: 'https://tasks.rdexperts.tech/support-ticket',
        icon: RnDIcon,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
