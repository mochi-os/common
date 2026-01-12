'use client'

import * as React from 'react'
import { useScreenSize } from '../../hooks/use-screen-size'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'

const ResponsiveDialogContext = React.createContext<{
  shouldCloseOnInteractOutside: boolean
}>({
  shouldCloseOnInteractOutside: true,
})

interface BaseProps {
  children?: React.ReactNode
}

interface RootResponsiveDialogProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function ResponsiveDialog({
  children,
  shouldCloseOnInteractOutside = true,
  ...props
}: RootResponsiveDialogProps & { shouldCloseOnInteractOutside?: boolean }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogRoot = isDesktop ? Dialog : Drawer

  return (
    <ResponsiveDialogContext.Provider value={{ shouldCloseOnInteractOutside }}>
      <ResponsiveDialogRoot
        {...props}
        // Always allow mobile drawers to be dismissible for better UX
        // The shouldCloseOnInteractOutside setting only affects desktop dialogs
        {...(!isDesktop && { dismissible: true })}
      >
        {children}
      </ResponsiveDialogRoot>
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogTrigger({
  className,
  children,
  ...props
}: BaseProps & { className?: string; asChild?: boolean }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogTriggerComponent = isDesktop
    ? DialogTrigger
    : DrawerTrigger

  return (
    <ResponsiveDialogTriggerComponent className={className} {...props}>
      {children}
    </ResponsiveDialogTriggerComponent>
  )
}

function ResponsiveDialogClose({
  className,
  children,
  ...props
}: BaseProps & { className?: string; asChild?: boolean }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogCloseComponent = isDesktop ? DialogClose : DrawerClose

  return (
    <ResponsiveDialogCloseComponent className={className} {...props}>
      {children}
    </ResponsiveDialogCloseComponent>
  )
}

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: BaseProps & { className?: string } & React.ComponentProps<
    typeof DialogContent
  >) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogContentComponent = isDesktop
    ? DialogContent
    : DrawerContent
  const { shouldCloseOnInteractOutside } = React.useContext(
    ResponsiveDialogContext
  )

  return (
    <ResponsiveDialogContentComponent
      className={className}
      {...props}
      {...(isDesktop && {
        onInteractOutside: (e: any) => {
          if (!shouldCloseOnInteractOutside) {
            e.preventDefault()
          }
          props.onInteractOutside?.(e)
        },
      })}
    >
      {children}
    </ResponsiveDialogContentComponent>
  )
}

function ResponsiveDialogDescription({
  className,
  children,
  ...props
}: BaseProps & { className?: string }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogDescriptionComponent = isDesktop
    ? DialogDescription
    : DrawerDescription

  return (
    <ResponsiveDialogDescriptionComponent className={className} {...props}>
      {children}
    </ResponsiveDialogDescriptionComponent>
  )
}

function ResponsiveDialogHeader({
  className,
  children,
  ...props
}: BaseProps & { className?: string }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogHeaderComponent = isDesktop
    ? DialogHeader
    : DrawerHeader

  return (
    <ResponsiveDialogHeaderComponent className={className} {...props}>
      {children}
    </ResponsiveDialogHeaderComponent>
  )
}

function ResponsiveDialogTitle({
  className,
  children,
  ...props
}: BaseProps & { className?: string }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogTitleComponent = isDesktop ? DialogTitle : DrawerTitle

  return (
    <ResponsiveDialogTitleComponent className={className} {...props}>
      {children}
    </ResponsiveDialogTitleComponent>
  )
}

function ResponsiveDialogFooter({
  className,
  children,
  ...props
}: BaseProps & { className?: string }) {
  const { isDesktop } = useScreenSize()
  const ResponsiveDialogFooterComponent = isDesktop
    ? DialogFooter
    : DrawerFooter

  return (
    <ResponsiveDialogFooterComponent className={className} {...props}>
      {children}
    </ResponsiveDialogFooterComponent>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
}
