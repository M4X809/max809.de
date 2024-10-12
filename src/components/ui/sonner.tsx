"use client"

import { faArrowsRotate, faBadgeCheck, faExclamationTriangle, faInfo, faX } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon } from "@mantine/core"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme={"dark"}
      className="toaster group "
      toastOptions={{
        classNames: {
          title: "text-xl",
          toast:
            "group toast group-[.toaster]:bg-[rgba(1,1,1,0.35)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-none ",
          // description: " data-[type=error]:text-red-600 data-[type=success]:text-green-500 data-[type=warning]:text-yellow-500 data-[type=info]:text-blue-500 data-[type=loading]:text-blue-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          // cancelButton:
          //   "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "text-red-600 ",
          success: "text-green-600 ",
          warning: "text-yellow-600 ",
          info: "text-blue-600 ",
          loading: "text-blue-600",
          icon: "data-[icon]:size-5 place-self-center place-items-center justify-center align-middle",
          // closeButton: "data-[close-button]:right-0 data-[close-button]:left-auto data-[close-button]:border-none data-[close-button]:text-xl data-[close-button]:hover:bg-[rgba(0,0,0,0.15)] data-[close-button]:size-15 ",
        },

      }}
      icons={{
        error: <FontAwesomeIcon icon={faExclamationTriangle} size="xl" className="w-fit" />,
        success: <FontAwesomeIcon icon={faBadgeCheck} size="xl" className="w-fit" />,
        info: <FontAwesomeIcon icon={faInfo} size="xl" className="w-fit" />,
        warning: <FontAwesomeIcon icon={faExclamationTriangle} size="xl" className="w-fit" />,
        loading: <FontAwesomeIcon icon={faArrowsRotate} spin size="xl" className="w-fit" />,
      }}
      {...props}

      closeButton={false}
    />
  )
}


const DismissButton = ({ id }: { id: string }) => {
  return (
    <ActionIcon variant='transparent' className="absolute right-0 top-0 text-inherit  hover:text-[red] transition-colors duration-300 justify-center" onClick={() => toast.dismiss(id)}>
      <FontAwesomeIcon icon={faX} fixedWidth swapOpacity />
    </ActionIcon>
  )
}



export { Toaster, DismissButton }
